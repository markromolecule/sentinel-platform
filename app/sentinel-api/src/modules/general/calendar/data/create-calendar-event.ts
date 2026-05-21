import { type DbClient } from '@sentinel/db';
import { type CreateCalendarEventBody } from '../calendar.dto';

export type CreateCalendarEventDataArgs = {
    payload: CreateCalendarEventBody;
    createdBy: string;
    institutionId: string;
};

export async function createCalendarEventData(
    dbClient: DbClient,
    { payload, createdBy, institutionId }: CreateCalendarEventDataArgs,
) {
    const record = await dbClient
        .insertInto('calendar_events')
        .values({
            institution_id: institutionId,
            title: payload.title,
            description: payload.description ?? null,
            event_type: payload.eventType,
            target_audience: payload.targetAudience,
            start_date: new Date(payload.startDate),
            end_date: payload.endDate ? new Date(payload.endDate) : null,
            start_time: payload.startTime ?? null,
            end_time: payload.endTime ?? null,
            created_by: createdBy,
            updated_by: createdBy,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return record;
}
