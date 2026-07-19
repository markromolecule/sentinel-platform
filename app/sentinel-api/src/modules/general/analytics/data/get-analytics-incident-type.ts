import { type DbClient } from '@sentinel/db';
import { resolveRelatedInstitutions } from '../../notification/helper/resolve-related-institutions';

export type GetAnalyticsIncidentTypeDataArgs = {
    institutionId?: string;
    startAt?: Date;
    endAtExclusive?: Date;
};

export type IncidentTypeMetric = {
    type: string;
    count: number;
    percentage: number;
};

/**
 * Returns incident type distribution with counts and percentages within a period.
 */
export async function getAnalyticsIncidentTypeData(
    dbClient: DbClient,
    args: GetAnalyticsIncidentTypeDataArgs,
): Promise<IncidentTypeMetric[]> {
    const { institutionId, startAt, endAtExclusive } = args;

    const institutionIds = institutionId
        ? await resolveRelatedInstitutions(dbClient, institutionId)
        : [];

    let query = dbClient
        .selectFrom('flagged_incidents as fi')
        .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select(['fi.incident_type as type', (eb) => eb.fn.count('fi.incident_id').as('count')]);

    if (institutionIds.length > 0) {
        query = query.where('e.institution_id', 'in', institutionIds);
    }

    if (startAt) {
        query = query.where('fi.timestamp', '>=', startAt);
    }
    if (endAtExclusive) {
        query = query.where('fi.timestamp', '<', endAtExclusive);
    }

    const rows = await query.groupBy('fi.incident_type').execute();

    const totalCount = rows.reduce((sum, r) => sum + Number(r.count ?? 0), 0);

    return rows.map((row) => {
        const count = Number(row.count ?? 0);
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        return {
            type: String(row.type),
            count,
            percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        };
    });
}
