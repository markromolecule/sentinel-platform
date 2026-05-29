import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { type CreateCalendarEventBody, type UpdateCalendarEventBody } from '../calendar.dto';
import { createCalendarEventData, updateCalendarEventData, deleteCalendarEventData } from '../data';
import { getCalendarEventById } from './calendar-query.service';
import { ActivityNotificationService } from '../../notification/services/activity-notification.service';
import { LogsService } from '../../logs/logs.service';

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

    await ActivityNotificationService.notifyCalendarEventCreated({
        dbClient,
        actorUserId: userId,
        institutionId,
        eventId: record.event_id,
        payload,
    });

    if (institutionId && typeof dbClient.selectFrom === 'function') {
        try {
            await LogsService.createLog(dbClient, {
                userId,
                action: 'calendar.event_created',
                resourceType: 'calendar_event',
                resourceId: record.event_id,
                activeInstitutionId: institutionId,
                details: {
                    eventId: record.event_id,
                    title: payload.title,
                    type: payload.type,
                },
            });
        } catch (logErr) {
            console.error('Failed to log calendar.event_created:', logErr);
        }
    }

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
 * For events of type 'NOTE', only the creator can delete it.
 * For non-NOTE events, the user must have global calendar:delete permission.
 */
export async function deleteCalendarEvent({
    dbClient,
    eventId,
    institutionId,
    userId,
    hasDeletePermission,
    dependencies = { deleteCalendarEventData },
}: {
    dbClient: DbClient;
    eventId: string;
    institutionId: string;
    userId: string;
    hasDeletePermission: boolean;
    dependencies?: {
        deleteCalendarEventData: typeof deleteCalendarEventData;
    };
}) {
    // 1. Verify existence and scoping
    const event = await getCalendarEventById(dbClient, { eventId, institutionId });

    // 2. Perform permission and ownership checks
    if (event.createdBy !== userId) {
        throw new HTTPException(403, {
            message:
                '403|Forbidden. You do not have permission to delete this calendar event as you are not the creator.',
        });
    }

    // 3. Execute deletion
    await dependencies.deleteCalendarEventData(dbClient, {
        eventId,
        institutionId,
    });

    if (institutionId && typeof dbClient.selectFrom === 'function') {
        try {
            await LogsService.createLog(dbClient, {
                userId,
                action: 'calendar.event_deleted',
                resourceType: 'calendar_event',
                resourceId: eventId,
                activeInstitutionId: institutionId,
                details: {
                    eventId,
                    title: event.title,
                },
            });
        } catch (logErr) {
            console.error('Failed to log calendar.event_deleted:', logErr);
        }
    }

    return null;
}
