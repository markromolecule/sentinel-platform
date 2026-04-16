import { getRoomsData } from './data/get-rooms';
import { createRoomData } from './data/create-room';
import { updateRoomData } from './data/update-room';
import { deleteRoomData } from './data/delete-room';
import { type DbClient } from '@sentinel/db';
import { type CreateRoomBody, type UpdateRoomBody } from './room.dto';
import { HTTPException } from 'hono/http-exception';

export class RoomService {
    private static async getInstitutionName(dbClient: DbClient, institutionId?: string | null) {
        if (!institutionId) {
            return null;
        }

        const institution = await dbClient
            .selectFrom('institutions')
            .select('name')
            .where('id', '=', institutionId)
            .executeTakeFirst();

        return institution?.name ?? null;
    }

    static async getRooms(dbClient: DbClient, institutionId?: string, search?: string) {
        const rawRooms = await getRoomsData({ dbClient, institutionId, search });

        return rawRooms.map((room: any) => ({
            institution_id: room.institution_id,
            institution_name: room.institution_name ?? null,
            room_id: room.room_id,
            room_name: room.room_name,
            room_code: room.room_code,
            room_type: room.room_type,
            created_at: room.created_at,
            created_by: room.creator_first_name
                ? `${room.creator_first_name} ${room.creator_last_name}`
                : room.created_by,
            updated_at: room.updated_at,
            updated_by: room.updater_first_name
                ? `${room.updater_first_name} ${room.updater_last_name}`
                : room.updated_by,
        }));
    }

    static async createRoom(
        dbClient: DbClient,
        data: CreateRoomBody,
        createdBy: string,
        institutionId?: string,
    ) {
        const targetInstitutionId =
            institutionId && institutionId !== '' ? institutionId : data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to create room for user ${createdBy} without an institutionId`,
            );
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
                    room_type: data.room_type || 'LECTURE',
                    created_by: createdBy,
                    institution_id: targetInstitutionId,
                },
            });

            const institutionName = await this.getInstitutionName(dbClient, rawRoom.institution_id);

            return {
                institution_id: rawRoom.institution_id,
                institution_name: institutionName,
                room_id: rawRoom.room_id,
                room_name: rawRoom.room_name,
                room_code: rawRoom.room_code,
                room_type: rawRoom.room_type,
                created_at: rawRoom.created_at,
                created_by: rawRoom.created_by,
                updated_at: rawRoom.updated_at,
                updated_by: rawRoom.updated_by,
            };
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

    static async updateRoom(
        dbClient: DbClient,
        id: string,
        data: UpdateRoomBody,
        updatedBy: string,
        institutionId?: string,
    ) {
        const currentScopeInstitutionId = institutionId;
        const targetInstitutionId =
            institutionId && institutionId !== '' ? institutionId : data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to update room ${id} for user ${updatedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const rawRoom = await updateRoomData({
                dbClient,
                id,
                values: {
                    ...(data.name !== undefined ? { room_name: data.name } : {}),
                    ...(data.code !== undefined ? { room_code: data.code } : {}),
                    ...(data.room_type !== undefined ? { room_type: data.room_type } : {}),
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

            const institutionName = await this.getInstitutionName(dbClient, rawRoom.institution_id);

            return {
                institution_id: rawRoom.institution_id,
                institution_name: institutionName,
                room_id: rawRoom.room_id,
                room_name: rawRoom.room_name,
                room_code: rawRoom.room_code,
                room_type: rawRoom.room_type,
                created_at: rawRoom.created_at,
                created_by: rawRoom.created_by,
                updated_at: rawRoom.updated_at,
                updated_by: rawRoom.updated_by,
            };
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

    static async deleteRoom(
        dbClient: DbClient,
        id: string,
        deletedBy: string,
        institutionId?: string,
    ) {
        if (institutionId === '') {
            console.error(
                `Attempted to delete room ${id} for user ${deletedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            return await deleteRoomData({ dbClient, id, institutionId });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
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
}
