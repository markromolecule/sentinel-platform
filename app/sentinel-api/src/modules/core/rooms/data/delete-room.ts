import { type DbClient } from '@sentinel/db';

export type DeleteRoomDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteRoomData({ dbClient, id, institutionId }: DeleteRoomDataArgs) {
    let query = dbClient.deleteFrom('rooms').where('room_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const result = await query.executeTakeFirst();

    if (result.numDeletedRows === 0n) {
        const error = new Error('Room not found');
        error.name = 'NotFoundError';
        throw error;
    }

    return { success: true };
}
