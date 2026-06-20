import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteInstitutionData } from '../data/delete-institution';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

/**
 * Deletes a single institution by ID.
 * Fires an activity notification on success when an actor user ID is provided.
 *
 * @param dbClient - The active database client.
 * @param id - The institution UUID to delete.
 * @param actorUserId - Optional user ID for audit notification.
 * @returns The deleted institution record.
 */
export async function deleteInstitution(dbClient: DbClient, id: string, actorUserId?: string) {
    try {
        const deletedInstitution = await deleteInstitutionData({ dbClient, id });

        if (actorUserId) {
            await ActivityNotificationService.notifySupportInstitutionOperationCompleted({
                dbClient,
                actorUserId,
                institutionId: deletedInstitution.id,
                institutionRecordId: deletedInstitution.id,
                institutionLabel: deletedInstitution.name,
                operation: 'DELETED',
            });
        }

        return deletedInstitution;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message ?? '';

        if (
            code === 'P2003' ||
            code === '23503' ||
            (code === 'P2010' && message.includes('23503'))
        ) {
            throw new HTTPException(409, {
                message: 'Cannot delete institution because it is being used.',
            });
        }
        if (error.name === 'NotFoundError') {
            throw new HTTPException(404, { message: 'Institution not found' });
        }
        throw error;
    }
}
