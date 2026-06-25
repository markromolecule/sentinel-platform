import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export async function assertRoomBelongsToInstitution(args: {
    dbClient: DbClient;
    roomId?: string | null;
    institutionId?: string | null;
}) {
    const { dbClient, roomId, institutionId } = args;

    if (!roomId) {
        return;
    }

    if (!institutionId) {
        throw new HTTPException(400, {
            message: 'Room selection requires an institution-scoped exam.',
        });
    }

    const room = await dbClient
        .selectFrom('rooms')
        .select(['room_id', 'institution_id'])
        .where('room_id', '=', roomId)
        .where('institution_id', '=', institutionId)
        .executeTakeFirst();

    if (!room) {
        throw new HTTPException(400, {
            message: 'Selected room was not found in the current institution.',
        });
    }
}
