import { type DbClient } from '@sentinel/db';

export type DeleteCalendarEventDataArgs = {
    eventId: string;
    institutionId: string;
};

export async function deleteCalendarEventData(
    dbClient: DbClient,
    { eventId, institutionId }: DeleteCalendarEventDataArgs,
) {
    const result = await dbClient
        .deleteFrom('calendar_events')
        .where('event_id', '=', eventId)
        .where('institution_id', '=', institutionId)
        .executeTakeFirst();

    return result;
}
