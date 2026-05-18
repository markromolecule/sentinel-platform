import { type DbClient } from '@sentinel/db';

export type CreateRoomDataArgs = {
    dbClient: DbClient;
    values: {
        room_name: string;
        room_code?: string | null;
        room_number: string;
        room_type?: any; // Use any or RoomType if imported, but for now any is safer until we import types
        status?: any;
        institution_id: string;
        created_by: string;
    };
};

export async function createRoomData({ dbClient, values }: CreateRoomDataArgs) {
    return await dbClient
        .insertInto('rooms')
        .values({
            room_name: values.room_name,
            room_code: values.room_code || null,
            room_number: values.room_number,
            room_type: values.room_type || 'LECTURE',
            status: values.status || 'AVAILABLE',
            institution_id: values.institution_id,
            created_by: values.created_by,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}
