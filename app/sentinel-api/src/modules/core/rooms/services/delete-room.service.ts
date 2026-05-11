import { type DbClient } from '@sentinel/db';
import { deleteRoomData } from '../data/delete-room';
import { hideInheritedRecord } from '../../inheritance/inheritable-write-helper';
import { getRoomSummaryById, buildRoomLabel, ROOM_INHERITANCE_CONFIG } from './_utils';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { HTTPException } from 'hono/http-exception';

export type DeleteRoomServiceArgs = {
    dbClient: DbClient;
    id: string;
    deletedBy: string;
    institutionId?: string;
};

export async function deleteRoomService({
    dbClient,
    id,
    deletedBy,
    institutionId,
}: DeleteRoomServiceArgs) {
    if (institutionId === '') {
        throw new HTTPException(403, {
            message:
                'Your account is not associated with an institution. Please contact your administrator.',
        });
    }

    try {
        const existingRoom = await getRoomSummaryById(dbClient, id, institutionId);
        const hiddenRoom = await hideInheritedRecord({
            dbClient,
            config: ROOM_INHERITANCE_CONFIG,
            id,
            institutionId,
            actorId: deletedBy,
        });

        if (hiddenRoom) {
            if (institutionId) {
                const roomLabel = buildRoomLabel(
                    hiddenRoom.room_name,
                    hiddenRoom.room_code,
                    hiddenRoom.room_number,
                );
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId: deletedBy,
                    institutionId,
                    operation: 'OVERRIDE_COMPLETED',
                    targetType: 'ROOM',
                    targetId: hiddenRoom.room_id,
                    targetLabel: roomLabel,
                    title: 'Room override applied',
                    message: `A room override was applied to "${roomLabel}".`,
                    sourceModule: 'rooms',
                    sourceAction: 'hide-inherited',
                    isAdminOverride: true,
                    metadata: {
                        roomId: hiddenRoom.room_id,
                    },
                });
            }
            return hiddenRoom;
        }

        const deletedRoom = await deleteRoomData({ dbClient, id, institutionId });

        if (institutionId) {
            const roomLabel = buildRoomLabel(
                existingRoom?.room_name,
                existingRoom?.room_code,
                existingRoom?.room_number,
            );
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId: deletedBy,
                institutionId,
                operation: 'DELETED',
                targetType: 'ROOM',
                targetId: id,
                targetLabel: roomLabel,
                title: 'Room deleted',
                message: `A room was deleted: "${roomLabel}".`,
                sourceModule: 'rooms',
                sourceAction: 'delete',
                metadata: {
                    roomId: id,
                },
            });
        }

        return deletedRoom;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message ?? '';
        if (
            code === 'P2003' ||
            code === '23503' ||
            (code === 'P2010' && message.includes('23503'))
        ) {
            throw new HTTPException(409, {
                message: 'Cannot delete room because it is being used.',
            });
        }
        if (error.name === 'NotFoundError') {
            throw new HTTPException(404, { message: 'Room not found' });
        }
        throw error;
    }
}
