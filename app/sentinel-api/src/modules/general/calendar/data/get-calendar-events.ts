import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetCalendarEventsDataArgs = {
    institutionId: string;
    month?: string;
    year?: string;
};

export async function getCalendarEventsData(
    dbClient: DbClient,
    { institutionId, month, year }: GetCalendarEventsDataArgs,
) {
    let query = dbClient
        .selectFrom('calendar_events as ce')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'ce.created_by')
        .select([
            'ce.event_id as eventId',
            'ce.institution_id as institutionId',
            'ce.title',
            'ce.description',
            'ce.event_type as eventType',
            'ce.target_audience as targetAudience',
            'ce.start_date as startDate',
            'ce.end_date as endDate',
            'ce.start_time as startTime',
            'ce.end_time as endTime',
            'ce.created_by as createdBy',
            'ce.updated_by as updatedBy',
            'ce.created_at as createdAt',
            'ce.updated_at as updatedAt',
            sql<string | null>`nullif(trim(concat_ws(' ', creator.first_name, creator.last_name)), '')`.as('createdByName'),
        ])
        .where('ce.institution_id', '=', institutionId);

    if (month) {
        query = query.where(sql<boolean>`extract(month from ce.start_date) = ${parseInt(month, 10)}`);
    }

    if (year) {
        query = query.where(sql<boolean>`extract(year from ce.start_date) = ${parseInt(year, 10)}`);
    }

    return await query.orderBy('ce.start_date', 'asc').execute();
}
