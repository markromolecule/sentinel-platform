import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { resolveCalendarScopeInstitutionIds } from './resolve-calendar-scope-institution-ids';

export type GetCalendarEventByIdDataArgs = {
    eventId: string;
    institutionId: string;
};

export async function getCalendarEventByIdData(
    dbClient: DbClient,
    { eventId, institutionId }: GetCalendarEventByIdDataArgs,
) {
    const allowedInstitutionIds = await resolveCalendarScopeInstitutionIds(dbClient, institutionId);

    const record = await dbClient
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
        .where('ce.event_id', '=', eventId)
        .where('ce.institution_id', 'in', allowedInstitutionIds)
        .executeTakeFirst();

    return record;
}
