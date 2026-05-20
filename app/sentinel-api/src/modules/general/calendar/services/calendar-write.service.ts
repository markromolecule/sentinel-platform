import { type DbClient } from '@sentinel/db';
import { type CreateCalendarEventBody, type UpdateCalendarEventBody } from '../calendar.dto';
import { createCalendarEventData, updateCalendarEventData, deleteCalendarEventData } from '../data';
import { getCalendarEventById } from './calendar-query.service';

/**
 * Creates a new calendar event and returns the fully populated record.
 */
export async function createCalendarEvent({
    dbClient,
    payload,
    userId,
    institutionId,
}: {
    dbClient: DbClient;
    payload: CreateCalendarEventBody;
    userId: string;
    institutionId: string;
}) {
    const record = await createCalendarEventData(dbClient, {
        payload,
        createdBy: userId,
        institutionId,
    });

    // Fetch the fully populated record including creator name
    return await getCalendarEventById(dbClient, {
        eventId: record.event_id,
        institutionId,
    });
}

/**
 * Updates an existing calendar event. Verifies ownership/institution scoping first.
 */
export async function updateCalendarEvent({
    dbClient,
    eventId,
    payload,
    userId,
    institutionId,
}: {
    dbClient: DbClient;
    eventId: string;
    payload: UpdateCalendarEventBody;
    userId: string;
    institutionId: string;
}) {
    // 1. Verify existence and institution scoping (throws 404 if not found)
    await getCalendarEventById(dbClient, { eventId, institutionId });

    // 2. Perform the update
    await updateCalendarEventData(dbClient, {
        eventId,
        payload,
        updatedBy: userId,
    });

    // 3. Fetch the fully populated updated record
    return await getCalendarEventById(dbClient, {
        eventId,
        institutionId,
    });
}

/**
 * Deletes a calendar event after verifying it exists and belongs to the institution.
 */
export async function deleteCalendarEvent({
    dbClient,
    eventId,
    institutionId,
    dependencies = { deleteCalendarEventData },
}: {
    dbClient: DbClient;
    eventId: string;
    institutionId: string;
    dependencies?: {
        deleteCalendarEventData: typeof deleteCalendarEventData;
    };
}) {
    // 1. Verify existence and scoping
    await getCalendarEventById(dbClient, { eventId, institutionId });

    // 2. Execute deletion
    await dependencies.deleteCalendarEventData(dbClient, {
        eventId,
        institutionId,
    });

    return null;
}
