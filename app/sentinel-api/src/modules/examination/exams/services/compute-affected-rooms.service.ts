import type { RawExamRecord } from './map-exam-response.service';

/**
 * Computes all unique rooms affected by the current state and new assignments.
 */
export function computeAffectedRooms(
    current: RawExamRecord,
    nextRoomId: string | null,
    nextAssignments: Array<{ roomId: string | null }>,
): Set<string> {
    const affectedRooms = new Set<string>();
    if (current.room_id) {
        affectedRooms.add(current.room_id);
    }
    if (nextRoomId) {
        affectedRooms.add(nextRoomId);
    }
    for (const a of nextAssignments) {
        if (a.roomId) {
            affectedRooms.add(a.roomId);
        }
    }
    return affectedRooms;
}
