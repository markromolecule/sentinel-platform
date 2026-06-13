import { type DbClient } from '@sentinel/db';

/**
 * Recalculates the availability status of one or more rooms.
 * Sets status to 'ASSIGNED' if there are active, non-draft, non-completed/archived exams
 * scheduled currently in the room. Otherwise sets it to 'AVAILABLE'.
 * Note: Rooms currently in 'MAINTENANCE' status are skipped.
 *
 * @param dbClient - The database client instance (supports transactions)
 * @param roomIds - A single room ID or an array of room IDs to update
 */
export async function recalculateRoomStatus(
    dbClient: DbClient,
    roomIds: string | string[],
): Promise<void> {
    const ids = Array.isArray(roomIds) ? roomIds : [roomIds];
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    if (uniqueIds.length === 0) {
        return;
    }

    const now = new Date();

    for (const roomId of uniqueIds) {
        // Query if there is an active exam currently occupying this room
        const activeExam = await dbClient
            .selectFrom('exams')
            .select('exam_id')
            .where('room_id', '=', roomId)
            .where('status', 'not in', ['DRAFT', 'ARCHIVED', 'COMPLETED'])
            .where('scheduled_date', '<=', now)
            .where('end_date_time', '>=', now)
            .executeTakeFirst();

        const targetStatus = activeExam ? 'ASSIGNED' : 'AVAILABLE';

        // Update the room's status, leaving MAINTENANCE rooms untouched
        await dbClient
            .updateTable('rooms')
            .set({ status: targetStatus, updated_at: new Date() })
            .where('room_id', '=', roomId)
            .where('status', '!=', 'MAINTENANCE')
            .execute();
    }
}
