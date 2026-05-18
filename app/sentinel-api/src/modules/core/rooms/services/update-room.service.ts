import { type DbClient } from '@sentinel/db';
import { type UpdateRoomBody } from '../room.dto';
import { updateRoomData } from '../data/update-room';
import { upsertInheritedOverride } from '../../inheritance/inheritable-write-helper';
import { getInstitutionName, buildRoomLabel, ROOM_INHERITANCE_CONFIG } from './_utils';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { HTTPException } from 'hono/http-exception';

export type UpdateRoomServiceArgs = {
    dbClient: DbClient;
    id: string;
    data: UpdateRoomBody;
    updatedBy: string;
    institutionId?: string;
};

export async function updateRoomService({
    dbClient,
    id,
    data,
    updatedBy,
    institutionId,
}: UpdateRoomServiceArgs) {
    const currentScopeInstitutionId = institutionId;
    const targetInstitutionId =
        institutionId && institutionId !== '' ? institutionId : data.institution_id;

    if (!targetInstitutionId || targetInstitutionId === '') {
        throw new HTTPException(403, {
            message:
                'Your account is not associated with an institution. Please contact your administrator.',
        });
    }

    try {
        const overrideRoom = await upsertInheritedOverride({
            dbClient,
            config: ROOM_INHERITANCE_CONFIG,
            id,
            institutionId:
                currentScopeInstitutionId && currentScopeInstitutionId !== ''
                    ? currentScopeInstitutionId
                    : targetInstitutionId,
            actorId: updatedBy,
            values: {
                ...(data.name !== undefined ? { room_name: data.name } : {}),
                ...(data.code !== undefined ? { room_code: data.code } : {}),
                ...(data.room_number !== undefined ? { room_number: data.room_number } : {}),
                ...(data.room_type !== undefined ? { room_type: data.room_type } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                updated_by: updatedBy,
                updated_at: new Date(),
            },
        });

        if (overrideRoom) {
            const institutionName = await getInstitutionName(dbClient, overrideRoom.institution_id);

            return {
                institution_id: overrideRoom.institution_id,
                institution_name: institutionName,
                room_id: overrideRoom.room_id,
                room_name: overrideRoom.room_name,
                room_code: overrideRoom.room_code,
                room_number: overrideRoom.room_number,
                room_type: overrideRoom.room_type,
                status: overrideRoom.status,
                created_at: overrideRoom.created_at,
                created_by: overrideRoom.created_by,
                updated_at: overrideRoom.updated_at,
                updated_by: overrideRoom.updated_by,
            };
        }

        const rawRoom = await updateRoomData({
            dbClient,
            id,
            values: {
                ...(data.name !== undefined ? { room_name: data.name } : {}),
                ...(data.code !== undefined ? { room_code: data.code } : {}),
                ...(data.room_number !== undefined ? { room_number: data.room_number } : {}),
                ...(data.room_type !== undefined ? { room_type: data.room_type } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(targetInstitutionId !== undefined
                    ? { institution_id: targetInstitutionId }
                    : {}),
                updated_by: updatedBy,
                updated_at: new Date().toISOString(),
            },
            institutionId:
                currentScopeInstitutionId && currentScopeInstitutionId !== ''
                    ? currentScopeInstitutionId
                    : targetInstitutionId,
        });

        const institutionName = await getInstitutionName(dbClient, rawRoom.institution_id);
        const room = {
            institution_id: rawRoom.institution_id,
            institution_name: institutionName,
            room_id: rawRoom.room_id,
            room_name: rawRoom.room_name,
            room_code: rawRoom.room_code,
            room_number: rawRoom.room_number,
            room_type: rawRoom.room_type,
            status: rawRoom.status,
            created_at: rawRoom.created_at,
            created_by: rawRoom.created_by,
            updated_at: rawRoom.updated_at,
            updated_by: rawRoom.updated_by,
        };
        const roomLabel = buildRoomLabel(rawRoom.room_name, rawRoom.room_code, rawRoom.room_number);
        await ActivityNotificationService.notifyGenericInstitutionActivity({
            dbClient,
            actorUserId: updatedBy,
            institutionId:
                currentScopeInstitutionId && currentScopeInstitutionId !== ''
                    ? currentScopeInstitutionId
                    : targetInstitutionId,
            operation: 'UPDATED',
            targetType: 'ROOM',
            targetId: rawRoom.room_id,
            targetLabel: roomLabel,
            title: 'Room updated',
            message: `A room was updated: "${roomLabel}".`,
            sourceModule: 'rooms',
            sourceAction: 'update',
            metadata: {
                roomId: rawRoom.room_id,
            },
        });

        return room;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2002' || code === '23505') {
            throw new HTTPException(409, { message: 'Room name already exists' });
        }
        if (error.name === 'NotFoundError') {
            throw new HTTPException(404, { message: 'Room not found' });
        }
        throw error;
    }
}
