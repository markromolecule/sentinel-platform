import { type DbClient } from '@sentinel/db';

export type CreateRoomDataArgs = {
    dbClient: DbClient;
    values: {
        room_name: string;
        room_code?: string | null;
        room_type?: any; // Use any or RoomType if imported, but for now any is safer until we import types
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
            room_type: values.room_type || 'LECTURE',
            institution_id: values.institution_id,
            created_by: values.created_by,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}
