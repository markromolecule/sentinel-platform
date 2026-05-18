import { type DbClient } from '@sentinel/db';

export type UpdateRoomDataArgs = {
    dbClient: DbClient;
    id: string;
    values: {
        room_name?: string;
        room_code?: string | null;
        room_number?: string;
        room_type?: any;
        status?: any;
        institution_id?: string;
        updated_by: string;
        updated_at: string;
    };
    institutionId?: string;
};

export async function updateRoomData({ dbClient, id, values, institutionId }: UpdateRoomDataArgs) {
    let query = dbClient.updateTable('rooms').set(values).where('room_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const result = await query.returningAll().executeTakeFirst();

    if (!result) {
        const error = new Error('Room not found');
        error.name = 'NotFoundError';
        throw error;
    }

    return result;
}
