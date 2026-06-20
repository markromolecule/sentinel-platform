import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteSectionsData } from '../data/delete-sections';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type DeleteSectionsServiceArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Bulk-deletes sections by ID. Fires a single activity notification summarising
 * the number of records removed. Throws HTTP 409 if any section has linked records.
 *
 * @param args.dbClient - Database client
 * @param args.ids - Array of section IDs to delete
 * @param args.institutionId - Institution context for scoped operations
 * @param args.actorUserId - ID of the user performing the deletion
 * @returns The deleted section records
 */
export async function deleteSectionsService({
    dbClient,
    ids,
    institutionId,
    actorUserId,
}: DeleteSectionsServiceArgs) {
    try {
        const deletedSections = await deleteSectionsData({
            dbClient,
            ids,
            institutionId,
        });

        if (institutionId && deletedSections.length > 0) {
            await ActivityNotificationService.notifySectionDeleted({
                dbClient,
                actorUserId: actorUserId ?? ids[0],
                institutionId,
                sectionLabel: `${deletedSections.length} section${deletedSections.length === 1 ? '' : 's'}`,
                bulk: true,
                count: deletedSections.length,
            });
        }

        return deletedSections;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2003' || code === '23503') {
            throw new HTTPException(409, {
                message:
                    'Cannot delete one or more sections because they are currently linked to other records.',
            });
        }
        throw error;
    }
}

export type DeleteSectionsServiceResponse = Awaited<ReturnType<typeof deleteSectionsService>>;
