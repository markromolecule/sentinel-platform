import { type DbClient } from '@sentinel/db';
import { type BulkCreateRoomsBody } from '../room.dto';
import { createRoomsData } from '../data/create-rooms';
import { getInstitutionName } from './_utils';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { HTTPException } from 'hono/http-exception';

export type BulkCreateRoomsServiceArgs = {
    dbClient: DbClient;
    data: BulkCreateRoomsBody;
    createdBy: string;
    institutionId?: string;
};

export async function bulkCreateRoomsService({
    dbClient,
    data,
    createdBy,
    institutionId,
}: BulkCreateRoomsServiceArgs) {
    const targetInstitutionId =
        institutionId && institutionId !== '' ? institutionId : data.rooms[0]?.institution_id;

    if (!targetInstitutionId || targetInstitutionId === '') {
        throw new HTTPException(403, {
            message:
                'Your account is not associated with an institution. Please contact your administrator.',
        });
    }

    try {
        const rawRooms = await createRoomsData({
            dbClient,
            rooms: data.rooms.map((room) => ({
                room_name: room.name,
                room_code: room.code ?? null,
                room_number: room.room_number,
                room_type: room.room_type || 'LECTURE',
                created_by: createdBy,
                institution_id: targetInstitutionId,
            })),
        });

        const institutionName = await getInstitutionName(dbClient, targetInstitutionId);

        const rooms = rawRooms.map((rawRoom) => ({
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
        }));

        const label = `${rooms.length} room${rooms.length === 1 ? '' : 's'}`;
        await ActivityNotificationService.notifyGenericInstitutionActivity({
            dbClient,
            actorUserId: createdBy,
            institutionId: targetInstitutionId,
            operation: 'CREATED',
            targetType: 'ROOM',
            targetLabel: label,
            title: 'Rooms bulk created',
            message: `${label} were created via bulk upload.`,
            sourceModule: 'rooms',
            sourceAction: 'bulk-create',
            metadata: {
                roomIds: rooms.map((r) => r.room_id),
                count: rooms.length,
                bulk: true,
            },
        });

        return rooms;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message || '';

        if (
            code === 'P2002' ||
            code === '23505' ||
            (code === 'P2010' && message.includes('23505'))
        ) {
            throw new HTTPException(409, {
                message: 'One or more rooms already exist in the selected institution.',
            });
        }
        throw error;
    }
}
