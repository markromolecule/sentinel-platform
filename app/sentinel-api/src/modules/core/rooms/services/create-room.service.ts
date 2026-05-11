import { type DbClient } from '@sentinel/db';
import { type CreateRoomBody } from '../room.dto';
import { createRoomData } from '../data/create-room';
import { getInstitutionName, buildRoomLabel } from './_utils';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { HTTPException } from 'hono/http-exception';

export type CreateRoomServiceArgs = {
    dbClient: DbClient;
    data: CreateRoomBody;
    createdBy: string;
    institutionId?: string;
};

export async function createRoomService({
    dbClient,
    data,
    createdBy,
    institutionId,
}: CreateRoomServiceArgs) {
    const targetInstitutionId =
        institutionId && institutionId !== '' ? institutionId : data.institution_id;

    if (!targetInstitutionId || targetInstitutionId === '') {
        throw new HTTPException(403, {
            message:
                'Your account is not associated with an institution. Please contact your administrator.',
        });
    }

    try {
        const rawRoom = await createRoomData({
            dbClient,
            values: {
                room_name: data.name,
                room_code: data.code ?? null,
                room_number: data.room_number,
                room_type: data.room_type || 'LECTURE',
                created_by: createdBy,
                institution_id: targetInstitutionId,
            },
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
            created_at: rawRoom.created_at,
            created_by: rawRoom.created_by,
            updated_at: rawRoom.updated_at,
            updated_by: rawRoom.updated_by,
        };

        const roomLabel = buildRoomLabel(rawRoom.room_name, rawRoom.room_code, rawRoom.room_number);

        await ActivityNotificationService.notifyGenericInstitutionActivity({
            dbClient,
            actorUserId: createdBy,
            institutionId: targetInstitutionId,
            operation: 'CREATED',
            targetType: 'ROOM',
            targetId: rawRoom.room_id,
            targetLabel: roomLabel,
            title: 'Room created',
            message: `A room was created: "${roomLabel}".`,
            sourceModule: 'rooms',
            sourceAction: 'create',
            metadata: {
                roomId: rawRoom.room_id,
            },
        });

        return room;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message || '';

        if (
            code === 'P2002' ||
            code === '23505' ||
            (code === 'P2010' && message.includes('23505'))
        ) {
            throw new HTTPException(409, {
                message: 'Room already exists with this name in the selected institution.',
            });
        }
        throw error;
    }
}
