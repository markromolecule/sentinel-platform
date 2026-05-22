import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { resolveCalendarScopeInstitutionIds } from './resolve-calendar-scope-institution-ids';

export type GetCalendarEventsDataArgs = {
    institutionId: string;
    role?: string;
    month?: string;
    year?: string;
};

/**
 * Retrieves calendar events visible to the given institution, taking into
 * account role-based audience filtering and institution hierarchy visibility.
 */
export async function getCalendarEventsData(
    dbClient: DbClient,
    { institutionId, role, month, year }: GetCalendarEventsDataArgs,
) {
    const allowedInstitutionIds = await resolveCalendarScopeInstitutionIds(dbClient, institutionId);

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
            sql<
                string | null
            >`nullif(trim(concat_ws(' ', creator.first_name, creator.last_name)), '')`.as(
                'createdByName',
            ),
        ]);

    if (allowedInstitutionIds.length > 0) {
        query = query.where('ce.institution_id', 'in', allowedInstitutionIds);
    }

    // 2. Filter events depending on the requester's role
    if (role === 'student') {
        query = query.where('ce.target_audience', 'in', ['ALL', 'STUDENTS']);
    } else if (role === 'instructor') {
        query = query.where('ce.target_audience', 'in', ['ALL', 'INSTRUCTORS']);
    }

    if (month) {
        query = query.where(
            sql<boolean>`extract(month from ce.start_date) = ${parseInt(month, 10)}`,
        );
    }

    if (year) {
        query = query.where(sql<boolean>`extract(year from ce.start_date) = ${parseInt(year, 10)}`);
    }

    return await query.orderBy('ce.start_date', 'asc').execute();
}
