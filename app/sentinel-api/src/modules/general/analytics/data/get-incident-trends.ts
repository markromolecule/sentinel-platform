import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { resolveRelatedInstitutions } from '../../notification/helper/resolve-related-institutions';

export type GetIncidentTrendsArgs = {
    institutionId?: string;
    startAt: Date;
    endAtExclusive: Date;
    timezone?: string;
};

export type IncidentTrendRow = {
    name: string;
    incidents: number;
};

/**
 * Retrieves incident trends within the specified period.
 * Selects day/week/month bucket granularity dynamically, casting to Manila timezone.
 * Removes historical fallback queries.
 */
export async function getAnalyticsIncidentTrendsData(
    dbClient: DbClient,
    args: GetIncidentTrendsArgs,
): Promise<IncidentTrendRow[]> {
    const { institutionId, startAt, endAtExclusive, timezone = 'Asia/Manila' } = args;

    const institutionIds = institutionId
        ? await resolveRelatedInstitutions(dbClient, institutionId)
        : [];

    const diffMs = Math.abs(endAtExclusive.getTime() - startAt.getTime());
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let granularity: 'day' | 'week' | 'month' = 'day';
    if (diffDays > 31 && diffDays <= 180) {
        granularity = 'week';
    } else if (diffDays > 180) {
        granularity = 'month';
    }

    let query = dbClient
        .selectFrom('flagged_incidents as fi')
        .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select([
            sql<string>`to_char(date_trunc(${granularity}, fi.timestamp at time zone ${timezone}), 'YYYY-MM-DD')`.as(
                'bucket_key',
            ),
            sql<number>`coalesce(count(fi.incident_id), 0)`.as('incidents_count'),
        ])
        .where('fi.timestamp', '>=', startAt)
        .where('fi.timestamp', '<', endAtExclusive);

    if (institutionIds.length > 0) {
        query = query.where('e.institution_id', 'in', institutionIds);
    }

    const rows = await query
        .groupBy(sql`date_trunc(${granularity}, fi.timestamp at time zone ${timezone})`)
        .orderBy(sql`date_trunc(${granularity}, fi.timestamp at time zone ${timezone})`, 'asc')
        .execute();

    const result: IncidentTrendRow[] = [];
    const current = new Date(startAt);

    while (current < endAtExclusive) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const bucketKey = `${year}-${month}-${day}`;

        // Find if we have a matching row for this date bucket
        const matchedRow = rows.find((r) => r.bucket_key === bucketKey);
        const count = matchedRow ? Number(matchedRow.incidents_count) : 0;

        let name = '';
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        if (granularity === 'day') {
            name = `${monthNames[current.getMonth()]} ${current.getDate()}`;
        } else if (granularity === 'week') {
            name = `Week of ${monthNames[current.getMonth()]} ${current.getDate()}`;
        } else {
            name = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;
        }

        result.push({ name, incidents: count });

        // Increment current date
        if (granularity === 'day') {
            current.setDate(current.getDate() + 1);
        } else if (granularity === 'week') {
            current.setDate(current.getDate() + 7);
        } else {
            current.setMonth(current.getMonth() + 1);
        }
    }

    // Fallback in case of mismatched timezone keys
    if (result.length === 0 && rows.length > 0) {
        return rows.map((r, idx) => ({
            name: r.bucket_key || `Bucket ${idx + 1}`,
            incidents: Number(r.incidents_count),
        }));
    }

    return result;
}
