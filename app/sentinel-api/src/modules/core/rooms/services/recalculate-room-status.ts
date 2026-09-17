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
    const uniqueIds = Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
    if (uniqueIds.length === 0) {
        return;
    }

    const now = new Date();

    // Batch query direct exam assignments currently active
    const directExamRooms = await dbClient
        .selectFrom('exams')
        .select('room_id')
        .where('room_id', 'in', uniqueIds)
        .where('status', 'not in', ['DRAFT', 'ARCHIVED', 'COMPLETED'])
        .where('scheduled_date', '<=', now)
        .where('end_date_time', '>=', now)
        .execute();

    // Batch query section-split assignments currently active
    const sectionExamRooms = await dbClient
        .selectFrom('exam_section_assignments as esa')
        .innerJoin('exams as e', 'e.exam_id', 'esa.exam_id')
        .select('esa.room_id')
        .where('esa.room_id', 'in', uniqueIds)
        .where('e.status', 'not in', ['DRAFT', 'ARCHIVED', 'COMPLETED'])
        .where('e.scheduled_date', '<=', now)
        .where('e.end_date_time', '>=', now)
        .execute();

    const activeRoomIds = new Set<string>();
    for (const r of directExamRooms) {
        if (r.room_id) activeRoomIds.add(r.room_id);
    }
    for (const r of sectionExamRooms) {
        if (r.room_id) activeRoomIds.add(r.room_id);
    }

    const assignedIds = uniqueIds.filter((id) => activeRoomIds.has(id));
    const availableIds = uniqueIds.filter((id) => !activeRoomIds.has(id));

    if (assignedIds.length > 0) {
        await dbClient
            .updateTable('rooms')
            .set({ status: 'ASSIGNED', updated_at: now })
            .where('room_id', 'in', assignedIds)
            .where('status', '!=', 'MAINTENANCE')
            .execute();
    }

    if (availableIds.length > 0) {
        await dbClient
            .updateTable('rooms')
            .set({ status: 'AVAILABLE', updated_at: now })
            .where('room_id', 'in', availableIds)
            .where('status', '!=', 'MAINTENANCE')
            .execute();
    }
}
