import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { type CreateCalendarEventBody, type UpdateCalendarEventBody } from '../calendar.dto';
import { createCalendarEventData, updateCalendarEventData, deleteCalendarEventData } from '../data';
import { getCalendarEventById } from './calendar-query.service';
import { NotificationService } from '../../notification/notification.service';

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

    // Resolve target institutions (include child branches if parent branch)
    const branches = await dbClient
        .selectFrom('institutions')
        .select('id')
        .where('parent_institution_id', '=', institutionId)
        .execute();
    const targetInstitutionIds = [institutionId, ...branches.map((b) => b.id)];

    // Map target audience to roles
    let targetRoles: string[] = [];
    if (payload.targetAudience === 'ALL' || !payload.targetAudience) {
        targetRoles = ['student', 'instructor', 'admin', 'superadmin'];
    } else if (payload.targetAudience === 'STUDENTS') {
        targetRoles = ['student'];
    } else if (payload.targetAudience === 'INSTRUCTORS') {
        targetRoles = ['instructor'];
    } else if (payload.targetAudience === 'ADMINS') {
        targetRoles = ['admin', 'superadmin'];
    } else {
        targetRoles = ['student', 'instructor', 'admin', 'superadmin'];
    }

    // Query recipient user profiles
    const recipients = await dbClient
        .selectFrom('user_profiles as up')
        .innerJoin('user_roles as ur', 'ur.user_id', 'up.user_id')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .select('up.user_id as userId')
        .where('up.institution_id', 'in', targetInstitutionIds)
        .where('r.role_name', 'in', targetRoles)
        .where('up.user_id', '!=', userId)
        .groupBy('up.user_id')
        .execute();

    // Create notifications for all resolved recipients
    await Promise.all(
        recipients.map((recipient) =>
            NotificationService.createNotification({
                dbClient,
                recipientUserId: recipient.userId,
                actorUserId: userId,
                institutionId,
                title: `New Calendar Event: ${payload.title}`,
                message: payload.description || `A new calendar event "${payload.title}" has been created.`,
                actionType: 'INSTITUTION_ACTIVITY_CREATED',
                resourceType: 'INSTITUTION_ACTIVITY',
                resourceId: record.event_id,
                resourceLabel: payload.title,
                metadata: {
                    eventType: payload.eventType,
                    targetAudience: payload.targetAudience,
                },
            }),
        ),
    );

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
    if (event.eventType === 'NOTE') {
        if (event.createdBy !== userId) {
            throw new HTTPException(403, {
                message: '403|Forbidden. You do not have permission to delete this calendar note as you are not the creator.',
            });
        }
    } else {
        if (!hasDeletePermission) {
            throw new HTTPException(403, {
                message: '403|Forbidden. You do not have permission to delete this calendar event.',
            });
        }
    }

    // 3. Execute deletion
    await dependencies.deleteCalendarEventData(dbClient, {
        eventId,
        institutionId,
    });

    return null;
}
