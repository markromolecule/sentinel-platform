import { type DbClient } from '@sentinel/db';

export type GetAnalyticsIncidentSeverityDataArgs = {
    institutionId?: string;
    startAt?: Date;
    endAtExclusive?: Date;
};

export type IncidentSeverityMetric = {
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    count: number;
    percentage: number;
};

/**
 * Returns incident severity distribution with counts and percentages within a period.
 */
export async function getAnalyticsIncidentSeverityData(
    dbClient: DbClient,
    args: GetAnalyticsIncidentSeverityDataArgs,
): Promise<IncidentSeverityMetric[]> {
    const { institutionId, startAt, endAtExclusive } = args;

    let query = dbClient
        .selectFrom('flagged_incidents as fi')
        .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select(['fi.severity', (eb) => eb.fn.count('fi.incident_id').as('count')]);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    if (startAt) {
        query = query.where('fi.timestamp', '>=', startAt);
    }
    if (endAtExclusive) {
        query = query.where('fi.timestamp', '<', endAtExclusive);
    }

    const rows = await query.groupBy('fi.severity').execute();

    const totalCount = rows.reduce((sum, r) => sum + Number(r.count ?? 0), 0);

    return rows.map((row) => {
        const count = Number(row.count ?? 0);
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        return {
            severity: (row.severity ?? 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
            count,
            percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        };
    });
}
