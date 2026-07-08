import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { getProctorAssignmentColumnSupport } from '../../exams/helper/exam-schema-compat';

export const EXAM_ASSIGNMENT_ACCESS_STATUSES = ['ACCEPTED'] as const;

export function getExamAssignmentAccessStatuses() {
    return [...EXAM_ASSIGNMENT_ACCESS_STATUSES];
}

async function buildSharedAssignmentVisibilityPredicates(args: {
    dbClient: DbClient;
    userId: string;
}) {
    const { dbClient, userId } = args;
    const proctorAssignmentSupport = await getProctorAssignmentColumnSupport(dbClient);
    const allowedStatuses = getExamAssignmentAccessStatuses();
    const visibilityPredicates = [];

    visibilityPredicates.push(sql<boolean>`exists (
        select 1
        from exam_section_assignments as esa
        where esa.exam_id = e.exam_id
          and esa.instructor_id = ${userId}
    )`);

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

/**
 * Builds the shared staff visibility predicate set for exam list/detail and
 * operational surfaces.
 */
export async function buildStaffExamVisibilityPredicates(args: {
    dbClient: DbClient;
    userId: string;
    institutionId?: string;
    includePublicInstitutionExams?: boolean;
}) {
    const {
        dbClient,
        userId,
        institutionId,
        includePublicInstitutionExams = true,
    } = args;

    const visibilityPredicates = [];

    if (includePublicInstitutionExams && institutionId) {
        visibilityPredicates.push(sql<boolean>`(
            e.is_public = true
            and e.institution_id = ${institutionId}
        )`);
    }

    visibilityPredicates.push(sql<boolean>`e.created_by = ${userId}`);
    visibilityPredicates.push(...(await buildSharedAssignmentVisibilityPredicates({ dbClient, userId })));
    visibilityPredicates.push(sql<boolean>`e.exam_id in (
        select es.exam_id
        from exam_shares as es
        where es.user_id = ${userId}
    )`);

    return visibilityPredicates;
}

/**
 * Builds instructor visibility predicates that require an explicit current
 * assignment instead of creator ownership or institution-wide public access.
 */
export async function buildAssignedInstructorExamVisibilityPredicates(args: {
    dbClient: DbClient;
    userId: string;
}) {
    const { dbClient, userId } = args;

    return buildSharedAssignmentVisibilityPredicates({ dbClient, userId });
}

/**
 * Builds instructor visibility predicates while excluding institution-wide
 * public access.
 */
export async function buildInstructorExamVisibilityPredicates(args: {
    dbClient: DbClient;
    userId: string;
}) {
    const { dbClient, userId } = args;

    return buildStaffExamVisibilityPredicates({
        dbClient,
        userId,
        includePublicInstitutionExams: false,
    });
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

/**
 * Throws when an instructor tries to access an attempt for an exam they are
 * not actively assigned to.
 */
export async function assertAssignedInstructorAttemptAccess(args: {
    dbClient: DbClient;
    attemptId: string;
    userId: string;
    institutionId?: string;
}) {
    const { dbClient, attemptId, userId, institutionId } = args;
    const visibilityPredicates = await buildAssignedInstructorExamVisibilityPredicates({
        dbClient,
        userId,
    });

    let query = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select(['ea.attempt_id'])
        .where('ea.attempt_id', '=', attemptId)
        .where(sql<boolean>`(${sql.join(visibilityPredicates, sql` or `)})`);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    const attempt = await query.executeTakeFirst();

    if (!attempt) {
        throw new HTTPException(404, {
            message: 'Attempt not found or you do not have access to it.',
        });
    }

    return attempt;
}
