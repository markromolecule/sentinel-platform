import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetIncidentTrendsArgs = {
    institutionId?: string;
};

export type IncidentTrendRow = {
    name: string;
    incidents: number;
};

/**
 * Retrieves weekly incident counts for the last 5 weeks for an institution.
 * Handles fallbacks if the data is older to ensure charts are always populated when data exists.
 */
export async function getAnalyticsIncidentTrendsData(
    dbClient: DbClient,
    args: GetIncidentTrendsArgs,
): Promise<IncidentTrendRow[]> {
    const { institutionId } = args;

    let query = dbClient
        .selectFrom('flagged_incidents as fi')
        .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select([
            sql<Date>`date_trunc('week', fi.timestamp)`.as('week_start'),
            sql<number>`coalesce(count(fi.incident_id), 0)`.as('incidents_count'),
        ])
        .where(sql<boolean>`fi.timestamp >= now() - interval '5 weeks'`);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    const rows = await query
        .groupBy(sql`date_trunc('week', fi.timestamp)`)
        .orderBy(sql`date_trunc('week', fi.timestamp)`, 'asc')
        .execute();

    const result: IncidentTrendRow[] = [];
    const now = new Date();

    const currentMonday = new Date(now);
    const day = currentMonday.getDay();
    const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1);
    currentMonday.setDate(diff);
    currentMonday.setHours(0, 0, 0, 0);

    for (let i = 4; i >= 0; i--) {
        const weekMonday = new Date(currentMonday);
        weekMonday.setDate(weekMonday.getDate() - i * 7);

        const matchedRow = rows.find((r) => {
            if (!r.week_start) return false;
            const d = new Date(r.week_start);
            return d.getTime() === weekMonday.getTime();
        });

        result.push({
            name: `Week ${5 - i}`,
            incidents: matchedRow ? Number(matchedRow.incidents_count) : 0,
        });
    }

    const totalFound = result.reduce((sum, r) => sum + r.incidents, 0);
    if (totalFound === 0) {
        let fallbackQuery = dbClient
            .selectFrom('flagged_incidents as fi')
            .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
            .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
            .select([
                sql<Date>`date_trunc('week', fi.timestamp)`.as('week_start'),
                sql<number>`coalesce(count(fi.incident_id), 0)`.as('incidents_count'),
            ]);

        if (institutionId) {
            fallbackQuery = fallbackQuery.where('e.institution_id', '=', institutionId);
        }

        const fallbackRows = await fallbackQuery
            .groupBy(sql`date_trunc('week', fi.timestamp)`)
            .orderBy(sql`date_trunc('week', fi.timestamp)`, 'desc')
            .limit(5)
            .execute();

        if (fallbackRows.length > 0) {
            const sorted = [...fallbackRows].reverse();
            return sorted.map((r, idx) => ({
                name: `Week ${idx + 1}`,
                incidents: Number(r.incidents_count),
            }));
        }
    }

    return result;
}
