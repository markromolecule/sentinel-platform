import { type DbClient } from '@sentinel/db';
import { type UpdateCalendarEventBody } from '../calendar.dto';

export type UpdateCalendarEventDataArgs = {
    eventId: string;
    payload: UpdateCalendarEventBody;
    updatedBy: string;
};

export async function updateCalendarEventData(
    dbClient: DbClient,
    { eventId, payload, updatedBy }: UpdateCalendarEventDataArgs,
) {
    const updateValues: any = {
        updated_by: updatedBy,
        updated_at: new Date(),
    };

    if (payload.title !== undefined) {
        updateValues.title = payload.title;
    }
    if (payload.description !== undefined) {
        updateValues.description = payload.description ?? null;
    }
    if (payload.eventType !== undefined) {
        updateValues.event_type = payload.eventType;
    }
    if (payload.targetAudience !== undefined) {
        updateValues.target_audience = payload.targetAudience;
    }
    if (payload.startDate !== undefined) {
        updateValues.start_date = new Date(payload.startDate);
    }
    if (payload.endDate !== undefined) {
        updateValues.end_date = payload.endDate ? new Date(payload.endDate) : null;
    }
    if (payload.startTime !== undefined) {
        updateValues.start_time = payload.startTime ?? null;
    }
    if (payload.endTime !== undefined) {
        updateValues.end_time = payload.endTime ?? null;
    }

    const record = await dbClient
        .updateTable('calendar_events')
        .set(updateValues)
        .where('event_id', '=', eventId)
        .returningAll()
        .executeTakeFirstOrThrow();

    return record;
}
