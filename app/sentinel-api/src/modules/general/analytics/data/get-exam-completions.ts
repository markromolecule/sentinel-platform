import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { resolveRelatedInstitutions } from '../../notification/helper/resolve-related-institutions';

export type GetExamCompletionsArgs = {
    institutionId?: string;
    startAt?: Date;
    endAtExclusive?: Date;
};

export type ExamCompletionRow = {
    name: string;
    completed: number;
    dropped: number;
};

/**
 * Retrieves exam attempt completion counts (completed vs dropped/incomplete)
 * grouped by day of the week for an institution.
 */
export async function getAnalyticsExamCompletionsData(
    dbClient: DbClient,
    args: GetExamCompletionsArgs,
): Promise<ExamCompletionRow[]> {
    const { institutionId, startAt, endAtExclusive } = args;

    const institutionIds = institutionId
        ? await resolveRelatedInstitutions(dbClient, institutionId)
        : [];

    let query = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select([
            sql<string>`to_char(ea.started_at, 'Dy')`.as('day_name'),
            sql<number>`coalesce(count(case when ea.status = 'COMPLETED' then 1 end), 0)`.as(
                'completed',
            ),
            sql<number>`coalesce(count(case when ea.status != 'COMPLETED' then 1 end), 0)`.as(
                'dropped',
            ),
        ]);

    if (institutionIds.length > 0) {
        query = query.where('e.institution_id', 'in', institutionIds);
    }

    query = query.where('ea.started_at', 'is not', null);

    if (startAt) {
        query = query.where('ea.started_at', '>=', startAt);
    }
    if (endAtExclusive) {
        query = query.where('ea.started_at', '<', endAtExclusive);
    }

    const rows = await query
        .groupBy([sql`to_char(ea.started_at, 'Dy')`, sql`extract(isodow from ea.started_at)`])
        .orderBy(sql`extract(isodow from ea.started_at)`, 'asc')
        .execute();

    const dayMap: Record<string, { completed: number; dropped: number }> = {};
    for (const row of rows) {
        const normalized = String(row.day_name || '').trim();
        dayMap[normalized] = {
            completed: Number(row.completed),
            dropped: Number(row.dropped),
        };
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return daysOfWeek.map((day) => {
        const val = dayMap[day] || dayMap[day.substring(0, 3)] || { completed: 0, dropped: 0 };
        return {
            name: day,
            completed: val.completed,
            dropped: val.dropped,
        };
    });
}
