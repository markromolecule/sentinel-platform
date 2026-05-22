import { type DbClient } from '@sentinel/db';

export type GetAnalyticsKPIsDataArgs = {
    institutionId?: string;
};

export type RawKPIAggregates = {
    totalExams: number;
    totalAttempts: number;
    completedAttempts: number;
    totalIncidents: number;
    flaggedAttempts: number;
    activeExams: number;
};

/**
 * Aggregates analytical KPIs for a given institution.
 */
export async function getAnalyticsKPIsData(
    dbClient: DbClient,
    args: GetAnalyticsKPIsDataArgs,
): Promise<RawKPIAggregates> {
    const { institutionId } = args;

    // 1. Total Exams (non-draft)
    let examsQuery = dbClient.selectFrom('exams').select((eb) => eb.fn.countAll().as('count'));
    if (institutionId) {
        examsQuery = examsQuery.where('institution_id', '=', institutionId);
    }
    examsQuery = examsQuery.where('status', '!=', 'DRAFT');

    // 2. Total Attempts
    let totalAttemptsQuery = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select((eb) => eb.fn.countAll().as('count'));
    if (institutionId) {
        totalAttemptsQuery = totalAttemptsQuery.where('e.institution_id', '=', institutionId);
    }

    // 3. Completed Attempts
    let completedAttemptsQuery = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select((eb) => eb.fn.countAll().as('count'))
        .where('ea.status', '=', 'COMPLETED');
    if (institutionId) {
        completedAttemptsQuery = completedAttemptsQuery.where(
            'e.institution_id',
            '=',
            institutionId,
        );
    }

    // 4. Total Incidents
    let totalIncidentsQuery = dbClient
        .selectFrom('flagged_incidents as fi')
        .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select((eb) => eb.fn.countAll().as('count'));
    if (institutionId) {
        totalIncidentsQuery = totalIncidentsQuery.where('e.institution_id', '=', institutionId);
    }

    // 5. Flagged Attempts (attempts with at least one incident)
    let flaggedAttemptsQuery = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .innerJoin('flagged_incidents as fi', 'fi.attempt_id', 'ea.attempt_id')
        .select((eb) => eb.fn.count('ea.attempt_id').distinct().as('count'));
    if (institutionId) {
        flaggedAttemptsQuery = flaggedAttemptsQuery.where('e.institution_id', '=', institutionId);
    }

    // 6. Active Exams (status AVAILABLE, IN_PROGRESS, or ACTIVE)
    let activeExamsQuery = dbClient
        .selectFrom('exams')
        .select((eb) => eb.fn.countAll().as('count'))
        .where('status', 'in', ['AVAILABLE', 'IN_PROGRESS', 'ACTIVE']);
    if (institutionId) {
        activeExamsQuery = activeExamsQuery.where('institution_id', '=', institutionId);
    }

    const [examsRes, attemptsRes, completedRes, incidentsRes, flaggedAttemptsRes, activeRes] =
        await Promise.all([
            examsQuery.executeTakeFirst(),
            totalAttemptsQuery.executeTakeFirst(),
            completedAttemptsQuery.executeTakeFirst(),
            totalIncidentsQuery.executeTakeFirst(),
            flaggedAttemptsQuery.executeTakeFirst(),
            activeExamsQuery.executeTakeFirst(),
        ]);

    return {
        totalExams: Number(examsRes?.count ?? 0),
        totalAttempts: Number(attemptsRes?.count ?? 0),
        completedAttempts: Number(completedRes?.count ?? 0),
        totalIncidents: Number(incidentsRes?.count ?? 0),
        flaggedAttempts: Number(flaggedAttemptsRes?.count ?? 0),
        activeExams: Number(activeRes?.count ?? 0),
    };
}
