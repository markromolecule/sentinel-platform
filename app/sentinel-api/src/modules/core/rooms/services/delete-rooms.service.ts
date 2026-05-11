import { type DbClient } from '@sentinel/db';
import { deleteRoomsData } from '../data/delete-rooms';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { HTTPException } from 'hono/http-exception';

export type DeleteRoomsServiceArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
    actorUserId?: string;
};

export async function deleteRoomsService({
    dbClient,
    ids,
    institutionId,
    actorUserId,
}: DeleteRoomsServiceArgs) {
    try {
        const deletedRooms = await deleteRoomsData({ dbClient, ids, institutionId });

        if (actorUserId && institutionId && deletedRooms.length > 0) {
            const label = `${deletedRooms.length} room${deletedRooms.length === 1 ? '' : 's'}`;
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'DELETED',
                targetType: 'ROOM',
                targetLabel: label,
                title: 'Rooms deleted',
                message: `${label} were deleted.`,
                sourceModule: 'rooms',
                sourceAction: 'bulk-delete',
                metadata: {
                    roomIds: ids,
                    count: deletedRooms.length,
                    bulk: true,
                },
            });
        }

        return deletedRooms;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message ?? '';
        if (
            code === 'P2003' ||
            code === '23503' ||
            (code === 'P2010' && message.includes('23503'))
        ) {
            throw new HTTPException(409, {
                message: 'Cannot delete one or more rooms because they are currently in use.',
            });
        }
        throw error;
    }
}
