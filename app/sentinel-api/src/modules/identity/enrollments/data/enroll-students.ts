import { type DbClient, executeTransaction } from '@sentinel/db';
import { sql } from 'kysely';
import { EnrollStudentsBody } from '../enrollments.dto';
import { getAccessibleClassroomOrThrow } from '../../../core/classroom/services/classroom-access-query.service';
import { normalizeStudentNumbers } from './normalize-student-numbers';

export async function enrollStudentsData({
    dbClient,
    institutionId,
    userId,
    userRole,
    payload,
}: {
    dbClient: DbClient;
    institutionId: string;
    userId: string;
    userRole?: string;
    payload: EnrollStudentsBody;
}) {
    const classGroupId = payload.classGroupId;
    const studentNumbers = normalizeStudentNumbers(payload.studentNumbers);

    await getAccessibleClassroomOrThrow(dbClient, {
        classGroupId,
        userId,
        institutionId,
        userRole,
    });

    if (!studentNumbers.length) {
        return {
            enrolledCount: 0,
            failedCount: 0,
            results: [],
        };
    }

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

    // 2. Fetch Whitelist records for these students in a single query
    const whitelistRecords = await dbClient
        .selectFrom('student_whitelist')
        .selectAll()
        .where('institution_id', '=', institutionId)
        .where('student_number', 'in', studentNumbers)
        .execute();

    const whitelistMap = new Map(whitelistRecords.map((record) => [record.student_number, record]));

    const resultsMap = new Map<
        string,
        { studentNumber: string; status: 'SUCCESS' | 'FAILED'; reason?: string }
    >();
    const validWhitelist: typeof whitelistRecords = [];

    // 3. In-memory validation and scope partitioning
    for (const studentNumber of studentNumbers) {
        const whitelist = whitelistMap.get(studentNumber);

        if (!whitelist) {
            resultsMap.set(studentNumber, {
                studentNumber,
                status: 'FAILED',
                reason: 'Student not found in whitelist.',
            });
            continue;
        }

        if (
            classGroup.section_department_id &&
            whitelist.department_id !== classGroup.section_department_id
        ) {
            resultsMap.set(studentNumber, {
                studentNumber,
                status: 'FAILED',
                reason: 'Department mismatch.',
            });
            continue;
        }

        if (classGroup.section_course_id && whitelist.course_id !== classGroup.section_course_id) {
            resultsMap.set(studentNumber, {
                studentNumber,
                status: 'FAILED',
                reason: 'Course mismatch.',
            });
            continue;
        }

        validWhitelist.push(whitelist);
    }

    // 4. If no students passed in-memory validation, return early without DB writes
    if (validWhitelist.length === 0) {
        const results = studentNumbers.map((num) => resultsMap.get(num)!);
        return {
            enrolledCount: 0,
            failedCount: results.length,
            results,
        };
    }

    // 5. Atomic set-based batch persistence inside transaction
    try {
        await executeTransaction(dbClient, async (trx) => {
            // Batch multi-row upsert into `students` table
            const upsertedStudents = await trx
                .insertInto('students')
                .values(
                    validWhitelist.map((w) => ({
                        student_number: w.student_number,
                        institution_id: w.institution_id,
                        department_id: w.department_id,
                        course_id: w.course_id,
                        user_id: w.claimed_user_id ?? null,
                        updated_at: new Date(),
                    })),
                )
                .onConflict((oc) =>
                    oc.columns(['institution_id', 'student_number']).doUpdateSet({
                        department_id: (eb) => eb.ref('excluded.department_id'),
                        course_id: (eb) => eb.ref('excluded.course_id'),
                        user_id: sql`coalesce(excluded.user_id, students.user_id)`,
                        updated_at: new Date(),
                    }),
                )
                .returning(['student_id', 'user_id', 'student_number'])
                .execute();

            const studentByNumber = new Map(
                upsertedStudents.map((student) => [student.student_number, student]),
            );

            // Fetch existing enrollments for the upserted students in this class group
            const existingEnrollments = await trx
                .selectFrom('enrollments')
                .select('student_id')
                .where('class_group_id', '=', classGroupId)
                .where(
                    'student_id',
                    'in',
                    upsertedStudents.map((s) => s.student_id),
                )
                .execute();

            const existingEnrollmentStudentIds = new Set(
                existingEnrollments
                    .map((e) => e.student_id)
                    .filter((id): id is string => Boolean(id)),
            );

            const enrollmentsToInsert: { class_group_id: string; student_id: string }[] = [];

            for (const w of validWhitelist) {
                const student = studentByNumber.get(w.student_number);
                if (!student) {
                    resultsMap.set(w.student_number, {
                        studentNumber: w.student_number,
                        status: 'FAILED',
                        reason: 'Failed to resolve student record.',
                    });
                    continue;
                }

                if (existingEnrollmentStudentIds.has(student.student_id)) {
                    resultsMap.set(w.student_number, {
                        studentNumber: w.student_number,
                        status: 'FAILED',
                        reason: 'Student is already enrolled in the selected classroom.',
                    });
                } else {
                    enrollmentsToInsert.push({
                        class_group_id: classGroupId,
                        student_id: student.student_id,
                    });
                    resultsMap.set(w.student_number, {
                        studentNumber: w.student_number,
                        status: 'SUCCESS',
                    });
                }
            }

            if (enrollmentsToInsert.length > 0) {
                await trx
                    .insertInto('enrollments')
                    .values(enrollmentsToInsert)
                    .onConflict((oc) => oc.columns(['class_group_id', 'student_id']).doNothing())
                    .execute();
            }
        });
    } catch (error: any) {
        for (const w of validWhitelist) {
            resultsMap.set(w.student_number, {
                studentNumber: w.student_number,
                status: 'FAILED',
                reason: error?.message || 'Failed to enroll.',
            });
        }
    }

    const results = studentNumbers.map((num) => resultsMap.get(num)!);
    const enrolledCount = results.filter((r) => r.status === 'SUCCESS').length;
    const failedCount = results.filter((r) => r.status === 'FAILED').length;

    return {
        enrolledCount,
        failedCount,
        results,
    };
}
