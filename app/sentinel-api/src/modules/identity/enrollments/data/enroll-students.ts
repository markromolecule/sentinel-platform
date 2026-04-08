import { type DbClient } from '@sentinel/db';
import { EnrollStudentsBody } from '../enrollments.dto';

export async function enrollStudentsData({
    dbClient,
    institutionId,
    payload,
}: {
    dbClient: DbClient;
    institutionId: string;
    payload: EnrollStudentsBody;
}) {
    const { studentNumbers, classGroupId } = payload;

    // 1. Get Class Group context (Subject and Section)
    const classGroup = await dbClient
        .selectFrom('class_groups as cg')
        .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .select([
            'cg.class_group_id',
            's.subject_id',
            'sec.department_id as section_department_id',
            'sec.course_id as section_course_id',
        ])
        .where('cg.class_group_id', '=', classGroupId)
        .executeTakeFirst();

    if (!classGroup) {
        throw new Error('Class group not found.');
    }

    // 2. Fetch Whitelist records for these students
    const whitelistRecords = await dbClient
        .selectFrom('student_whitelist')
        .selectAll()
        .where('institution_id', '=', institutionId)
        .where('student_number', 'in', studentNumbers)
        .execute();
    const claimedUserIds = whitelistRecords
        .map((record) => record.claimed_user_id)
        .filter((claimedUserId): claimedUserId is string => Boolean(claimedUserId));
    const studentRecords =
        claimedUserIds.length > 0
            ? await dbClient
                  .selectFrom('students')
                  .select(['student_id', 'user_id'])
                  .where('user_id', 'in', claimedUserIds)
                  .execute()
            : [];
    const studentMap = new Map(
        studentRecords.map((studentRecord) => [studentRecord.user_id, studentRecord]),
    );
    const existingEnrollmentRows =
        studentRecords.length > 0
            ? await dbClient
                .selectFrom('enrollments')
                .select('student_id')
                .where('class_group_id', '=', classGroupId)
                .where(
                    'student_id',
                    'in',
                    studentRecords.map((studentRecord) => studentRecord.student_id),
                )
                .execute()
            : [];
    const existingEnrollmentStudentIds = new Set(
        existingEnrollmentRows
            .map((enrollment) => enrollment.student_id)
            .filter((studentId): studentId is string => Boolean(studentId)),
    );

    const results: { studentNumber: string; status: 'SUCCESS' | 'FAILED'; reason?: string }[] = [];
    let enrolledCount = 0;
    let failedCount = 0;

    for (const studentNumber of studentNumbers) {
        const whitelist = whitelistRecords.find((w) => w.student_number === studentNumber);

        if (!whitelist) {
            results.push({ studentNumber, status: 'FAILED', reason: 'Student not found in whitelist.' });
            failedCount++;
            continue;
        }

        // Validation: Existing on the course & department
        // We check if the whitelist record's department/course matches the section's department/course
        // Note: If section has no department/course, we might skip this or use subject's.
        // For now, let's assume the whitelist record itself defines their valid department/course.
        // The requirement says "existing on the course & department". 
        // We'll compare the whitelist's department_id with the section's department_id if present.
        
        if (classGroup.section_department_id && whitelist.department_id !== classGroup.section_department_id) {
            results.push({ studentNumber, status: 'FAILED', reason: 'Department mismatch.' });
            failedCount++;
            continue;
        }

        if (classGroup.section_course_id && whitelist.course_id !== classGroup.section_course_id) {
            results.push({ studentNumber, status: 'FAILED', reason: 'Course mismatch.' });
            failedCount++;
            continue;
        }

        // Validation: Claimed the account
        if (!whitelist.claimed_user_id) {
            results.push({ studentNumber, status: 'FAILED', reason: 'Account not yet claimed.' });
            failedCount++;
            continue;
        }

        // 3. Find student record
        const student = studentMap.get(whitelist.claimed_user_id);

        if (!student) {
            results.push({ studentNumber, status: 'FAILED', reason: 'Student profile not found even though account is claimed.' });
            failedCount++;
            continue;
        }

        if (existingEnrollmentStudentIds.has(student.student_id)) {
            results.push({
                studentNumber,
                status: 'FAILED',
                reason: 'Student is already enrolled in the selected section.',
            });
            failedCount++;
            continue;
        }

        // 4. Enroll the student
        try {
            await dbClient
                .insertInto('enrollments')
                .values({
                    class_group_id: classGroupId,
                    student_id: student.student_id,
                })
                .onConflict((oc) => oc.doNothing())
                .execute();

            results.push({ studentNumber, status: 'SUCCESS' });
            enrolledCount++;
            existingEnrollmentStudentIds.add(student.student_id);
        } catch (error: any) {
            results.push({ studentNumber, status: 'FAILED', reason: error?.message || 'Failed to enroll.' });
            failedCount++;
        }
    }

    return {
        enrolledCount,
        failedCount,
        results,
    };
}
