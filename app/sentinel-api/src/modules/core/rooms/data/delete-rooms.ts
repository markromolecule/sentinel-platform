import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type DeleteRoomsDataArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
};

export async function deleteRoomsData({ dbClient, ids, institutionId }: DeleteRoomsDataArgs) {
    if (!ids || ids.length === 0) {
        throw new HTTPException(400, { message: 'No room IDs provided' });
    }

    let query = dbClient.deleteFrom('rooms').where('room_id', 'in', ids);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const deletedRecords = await query.returning('room_id').execute();

    if (deletedRecords.length === 0) {
        throw new HTTPException(404, { message: 'Rooms not found or already deleted' });
    }

    return deletedRecords;
}
