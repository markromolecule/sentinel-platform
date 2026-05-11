import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { getProctorAssignmentColumnSupport } from '../../exams/helper/exam-schema-compat';

export const EXAM_ASSIGNMENT_ACCESS_STATUSES = ['ACCEPTED'] as const;

export function getExamAssignmentAccessStatuses() {
    return [...EXAM_ASSIGNMENT_ACCESS_STATUSES];
}

export async function buildInstructorExamVisibilityPredicates(args: {
    dbClient: DbClient;
    userId: string;
}) {
    const { dbClient, userId } = args;
    const proctorAssignmentSupport = await getProctorAssignmentColumnSupport(dbClient);
    const allowedStatuses = getExamAssignmentAccessStatuses();
    const visibilityPredicates = [sql<boolean>`e.created_by = ${userId}`];

    if (proctorAssignmentSupport.assigneeColumn === 'instructor_id') {
        visibilityPredicates.push(sql<boolean>`e.exam_id in (
            select pa.exam_id
            from proctor_assignments as pa
            where pa.instructor_id = ${userId}
              and pa.status in (${sql.join(
                  allowedStatuses.map((status) => sql`${status}`),
                  sql`, `,
              )})
              and pa.exam_id is not null
        )`);
    }

    if (proctorAssignmentSupport.assigneeColumn === 'user_id') {
        visibilityPredicates.push(sql<boolean>`e.exam_id in (
            select pa.exam_id
            from proctor_assignments as pa
            where pa.user_id = ${userId}
              and pa.status in (${sql.join(
                  allowedStatuses.map((status) => sql`${status}`),
                  sql`, `,
              )})
              and pa.exam_id is not null
        )`);
    }

    visibilityPredicates.push(sql<boolean>`e.exam_id in (
        select ex.exam_id
        from exams as ex
        inner join classroom_instructor_assignments as cia on ex.class_group_id = cia.class_group_id
        where cia.instructor_user_id = ${userId}
    )`);

    return visibilityPredicates;
}

export async function assertInstructorExamAccess(args: {
    dbClient: DbClient;
    examId: string;
    userId: string;
    institutionId?: string;
}) {
    const { dbClient, examId, userId, institutionId } = args;
    const visibilityPredicates = await buildInstructorExamVisibilityPredicates({
        dbClient,
        userId,
    });

    let query = dbClient
        .selectFrom('exams as e')
        .select(['e.exam_id'])
        .where('e.exam_id', '=', examId)
        .where(sql<boolean>`(${sql.join(visibilityPredicates, sql` or `)})`);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    const exam = await query.executeTakeFirst();

    if (!exam) {
        throw new HTTPException(404, {
            message: 'Exam not found or you do not have access to it.',
        });
    }

    return exam;
}
