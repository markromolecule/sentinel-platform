import { type DbClient } from '@sentinel/db';

export type CreateRoomsDataArgs = {
    dbClient: DbClient;
    rooms: {
        room_name: string;
        room_code?: string | null;
        room_number: string;
        room_type?: any;
        status?: any;
        institution_id: string;
        created_by: string;
    }[];
};

export async function createRoomsData({ dbClient, rooms }: CreateRoomsDataArgs) {
    return await dbClient
        .insertInto('rooms')
        .values(
            rooms.map((room) => ({
                room_name: room.room_name,
                room_code: room.room_code || null,
                room_number: room.room_number,
                room_type: room.room_type || 'LECTURE',
                status: room.status || 'AVAILABLE',
                institution_id: room.institution_id,
                created_by: room.created_by,
                updated_by: room.created_by,
                created_at: new Date(),
                updated_at: new Date(),
            })),
        )
        .returningAll()
        .execute();
}
