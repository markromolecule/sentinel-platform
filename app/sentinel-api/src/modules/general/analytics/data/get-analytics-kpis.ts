import { type DbClient } from '@sentinel/db';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import { sql } from 'kysely';

export type GetAnalyticsKPIsDataArgs = {
    institutionId?: string;
    startAt?: Date;
    endAtExclusive?: Date;
};

export type RawKPIAggregates = {
    totalExams: number;
    totalAttempts: number;
    completedAttempts: number;
    totalIncidents: number;
    flaggedAttempts: number;
    activeExams: number;
    averageScore: number;
    passRate: number;
};

/**
 * Aggregates analytical KPIs for a given institution within a period.
 * Uses half-open timestamp predicates for starts/ends.
 */
export async function getAnalyticsKPIsData(
    dbClient: DbClient,
    args: GetAnalyticsKPIsDataArgs,
): Promise<RawKPIAggregates> {
    const { institutionId, startAt, endAtExclusive } = args;
    const defaultPassingScore = DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultPassingScore;

    // 1. Total Exams (non-draft) scheduled within the period
    let examsQuery = dbClient.selectFrom('exams').select((eb) => eb.fn.countAll().as('count'));
    if (institutionId) {
        examsQuery = examsQuery.where('institution_id', '=', institutionId);
    }
    examsQuery = examsQuery.where('status', '!=', 'DRAFT');
    if (startAt) {
        examsQuery = examsQuery.where('scheduled_date', '>=', startAt);
    }
    if (endAtExclusive) {
        examsQuery = examsQuery.where('scheduled_date', '<', endAtExclusive);
    }

    // 2. Total Attempts started within the period
    let totalAttemptsQuery = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select((eb) => eb.fn.countAll().as('count'));
    if (institutionId) {
        totalAttemptsQuery = totalAttemptsQuery.where('e.institution_id', '=', institutionId);
    }
    if (startAt) {
        totalAttemptsQuery = totalAttemptsQuery.where('ea.started_at', '>=', startAt);
    }
    if (endAtExclusive) {
        totalAttemptsQuery = totalAttemptsQuery.where('ea.started_at', '<', endAtExclusive);
    }

    // 3. Completed Attempts started within the period
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
    if (startAt) {
        completedAttemptsQuery = completedAttemptsQuery.where('ea.started_at', '>=', startAt);
    }
    if (endAtExclusive) {
        completedAttemptsQuery = completedAttemptsQuery.where('ea.started_at', '<', endAtExclusive);
    }

    // 4. Total Incidents occurring within the period
    let totalIncidentsQuery = dbClient
        .selectFrom('flagged_incidents as fi')
        .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select((eb) => eb.fn.countAll().as('count'));
    if (institutionId) {
        totalIncidentsQuery = totalIncidentsQuery.where('e.institution_id', '=', institutionId);
    }
    if (startAt) {
        totalIncidentsQuery = totalIncidentsQuery.where('fi.timestamp', '>=', startAt);
    }
    if (endAtExclusive) {
        totalIncidentsQuery = totalIncidentsQuery.where('fi.timestamp', '<', endAtExclusive);
    }

    // 5. Flagged Attempts (attempts with at least one incident within the period)
    let flaggedAttemptsQuery = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .innerJoin('flagged_incidents as fi', 'fi.attempt_id', 'ea.attempt_id')
        .select((eb) => eb.fn.count('ea.attempt_id').distinct().as('count'));
    if (institutionId) {
        flaggedAttemptsQuery = flaggedAttemptsQuery.where('e.institution_id', '=', institutionId);
    }
    if (startAt) {
        flaggedAttemptsQuery = flaggedAttemptsQuery.where('fi.timestamp', '>=', startAt);
    }
    if (endAtExclusive) {
        flaggedAttemptsQuery = flaggedAttemptsQuery.where('fi.timestamp', '<', endAtExclusive);
    }

    // 6. Active Exams (status AVAILABLE, IN_PROGRESS, or ACTIVE at end boundary)
    let activeExamsQuery = dbClient
        .selectFrom('exams')
        .select((eb) => eb.fn.countAll().as('count'))
        .where('status', 'in', ['AVAILABLE', 'IN_PROGRESS', 'ACTIVE']);
    if (institutionId) {
        activeExamsQuery = activeExamsQuery.where('institution_id', '=', institutionId);
    }
    if (endAtExclusive) {
        activeExamsQuery = activeExamsQuery.where('scheduled_date', '<', endAtExclusive);
    }

    // 7. Aggregate score-based KPIs from completed attempts
    let scoreMetricsQuery = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select([
            sql<number>`coalesce(
                avg(
                    case
                        when ea.status = 'COMPLETED'
                            and ea.total_score is not null
                            and ea.total_score > 0
                        then (coalesce(ea.score, ea.initial_score, 0)::numeric / nullif(ea.total_score, 0)::numeric) * 100
                    end
                ),
                0
            )`.as('average_score'),
            sql<number>`count(
                case
                    when ea.status = 'COMPLETED'
                        and ea.total_score is not null
                        and ea.total_score > 0
                    then 1
                end
            )`.as('graded_completed_count'),
            sql<number>`count(
                case
                    when ea.status = 'COMPLETED'
                        and ea.total_score is not null
                        and ea.total_score > 0
                        and ((coalesce(ea.score, ea.initial_score, 0)::numeric / nullif(ea.total_score, 0)::numeric) * 100)
                            >= coalesce(e.passing_score, ${defaultPassingScore})
                    then 1
                end
            )`.as('passed_count'),
        ]);
    if (institutionId) {
        scoreMetricsQuery = scoreMetricsQuery.where('e.institution_id', '=', institutionId);
    }
    if (startAt) {
        scoreMetricsQuery = scoreMetricsQuery.where('ea.started_at', '>=', startAt);
    }
    if (endAtExclusive) {
        scoreMetricsQuery = scoreMetricsQuery.where('ea.started_at', '<', endAtExclusive);
    }

    const [
        examsRes,
        attemptsRes,
        completedRes,
        incidentsRes,
        flaggedAttemptsRes,
        activeRes,
        scoreMetricsRes,
    ] = await Promise.all([
        examsQuery.executeTakeFirst(),
        totalAttemptsQuery.executeTakeFirst(),
        completedAttemptsQuery.executeTakeFirst(),
        totalIncidentsQuery.executeTakeFirst(),
        flaggedAttemptsQuery.executeTakeFirst(),
        activeExamsQuery.executeTakeFirst(),
        scoreMetricsQuery.executeTakeFirst(),
    ]);

    const averageScore = Number((scoreMetricsRes as any)?.average_score ?? 0);
    const gradedCompletedCount = Number((scoreMetricsRes as any)?.graded_completed_count ?? 0);
    const passedCount = Number((scoreMetricsRes as any)?.passed_count ?? 0);
    const passRate = gradedCompletedCount > 0 ? (passedCount / gradedCompletedCount) * 100 : 0;

    return {
        totalExams: Number(examsRes?.count ?? 0),
        totalAttempts: Number(attemptsRes?.count ?? 0),
        completedAttempts: Number(completedRes?.count ?? 0),
        totalIncidents: Number(incidentsRes?.count ?? 0),
        flaggedAttempts: Number(flaggedAttemptsRes?.count ?? 0),
        activeExams: Number(activeRes?.count ?? 0),
        averageScore,
        passRate,
    };
}
