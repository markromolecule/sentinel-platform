import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteSemestersData } from '../data/delete-semesters';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type DeleteSemestersServiceArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Bulk-deletes semesters by ID. Fires a single activity notification
 * summarising the number of records removed. Throws 409 if any semester
 * is currently in use.
 *
 * @param args.dbClient - Database client
 * @param args.ids - Array of term IDs to delete
 * @param args.institutionId - Institution context for scoped operations
 * @param args.actorUserId - ID of the acting user for activity notifications
 * @returns The deleted semester records
 */
export async function deleteSemestersService({
    dbClient,
    ids,
    institutionId,
    actorUserId,
}: DeleteSemestersServiceArgs) {
    try {
        const deletedSemesters = await deleteSemestersData({ dbClient, ids, institutionId });

        if (actorUserId && institutionId && deletedSemesters.length > 0) {
            const label = `${deletedSemesters.length} semester${deletedSemesters.length === 1 ? '' : 's'}`;
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'DELETED',
                targetType: 'SEMESTER',
                targetLabel: label,
                title: 'Semesters deleted',
                message: `${label} were deleted.`,
                sourceModule: 'semesters',
                sourceAction: 'bulk-delete',
                metadata: {
                    termIds: deletedSemesters.map((semester) => semester.term_id),
                    count: deletedSemesters.length,
                    bulk: true,
                },
            });
        }

        return deletedSemesters;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message ?? '';
        if (
            code === 'P2003' ||
            code === '23503' ||
            (code === 'P2010' && message.includes('23503'))
        ) {
            throw new HTTPException(409, {
                message:
                    'Cannot delete one or more semesters because they are currently in use.',
            });
        }
        throw error;
    }
}

export type DeleteSemestersServiceResponse = Awaited<ReturnType<typeof deleteSemestersService>>;
