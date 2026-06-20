import { type DbClient } from '@sentinel/db';

type GetInstructorDashboardDataArgs = {
    dbClient: DbClient;
    requesterUserId: string;
    institutionId?: string;
};

/**
 * Retrieves dynamic dashboard metrics and recent exams for the authenticated instructor.
 *
 * @param args - Object containing the DB client, requester user ID, and optional institution ID
 * @returns An object containing stats and recent exams list
 */
export async function getInstructorDashboardData({
    dbClient,
    requesterUserId,
    institutionId,
}: GetInstructorDashboardDataArgs) {
    // 1. Get unique students count
    const studentCountResult = await dbClient
        .selectFrom('enrollments as e')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .select((eb) => eb.fn.count('e.student_id').distinct().as('count'))
        .where('cr.user_id', '=', requesterUserId)
        .where('r.role_name', '=', 'instructor')
        .where('cg.archived_at', 'is', null)
        .where('cg.class_name', 'is not', null)
        .executeTakeFirst();

    // 2. Get active classrooms count
    const classroomCountResult = await dbClient
        .selectFrom('class_groups as cg')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .select((eb) => eb.fn.count('cg.class_group_id').distinct().as('count'))
        .where('cr.user_id', '=', requesterUserId)
        .where('r.role_name', '=', 'instructor')
        .where('cg.archived_at', 'is', null)
        .where('cg.class_name', 'is not', null)
        .executeTakeFirst();

    // 3. Get enrolled subjects count
    const subjectCountResult = await dbClient
        .selectFrom('class_roles as cr')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'cr.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .innerJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .select((eb) => eb.fn.count('cg.subject_id').distinct().as('count'))
        .where('cr.user_id', '=', requesterUserId)
        .where('r.role_name', '=', 'instructor')
        .executeTakeFirst();

    // 4. Get exams created count
    const examCountResult = await dbClient
        .selectFrom('exams')
        .select((eb) => eb.fn.count('exam_id').as('count'))
        .where('created_by', '=', requesterUserId)
        .executeTakeFirst();

    // 5. Get recent exams list (limit to 5)
    let recentExamsQuery = dbClient
        .selectFrom('exams as ex')
        .leftJoin('subjects as sub', 'sub.subject_id', 'ex.subject_id')
        .select([
            'ex.exam_id',
            'ex.title',
            'ex.status',
            'ex.scheduled_date',
            'ex.duration_minutes',
            'ex.question_count',
            'sub.subject_title as subject_title',
            'sub.subject_code as subject_code',
            // Subquery for attempts count
            (eb) => eb
                .selectFrom('exam_attempts as ea')
                .select((eb) => eb.fn.count('ea.attempt_id').as('count'))
                .whereRef('ea.exam_id', '=', 'ex.exam_id')
                .as('attempts_count'),
            // Subquery for flagged incidents count
            (eb) => eb
                .selectFrom('flagged_incidents as fi')
                .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
                .select((eb) => eb.fn.count('fi.incident_id').as('count'))
                .whereRef('ea.exam_id', '=', 'ex.exam_id')
                .as('incidents_count'),
        ])
        .where('ex.created_by', '=', requesterUserId);

    if (institutionId) {
        recentExamsQuery = recentExamsQuery.where('ex.institution_id', '=', institutionId);
    }

    const recentExams = await recentExamsQuery
        .orderBy('ex.created_at', 'desc')
        .limit(5)
        .execute();

    return {
        stats: {
            totalStudents: Number(studentCountResult?.count || 0),
            totalClassrooms: Number(classroomCountResult?.count || 0),
            totalSubjects: Number(subjectCountResult?.count || 0),
            examsCreated: Number(examCountResult?.count || 0),
        },
        recentExams: recentExams.map((exam) => ({
            exam_id: exam.exam_id,
            title: exam.title,
            status: exam.status ?? 'DRAFT',
            scheduled_date: exam.scheduled_date ? exam.scheduled_date.toISOString() : null,
            duration_minutes: exam.duration_minutes,
            question_count: exam.question_count,
            subject_title: exam.subject_title,
            subject_code: exam.subject_code,
            attempts_count: Number(exam.attempts_count || 0),
            incidents_count: Number(exam.incidents_count || 0),
        })),
    };
}
