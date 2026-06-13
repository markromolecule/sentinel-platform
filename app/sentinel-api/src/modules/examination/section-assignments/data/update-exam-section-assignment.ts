import { type DbClient } from '@sentinel/db';

export async function updateExamSectionAssignment(args: {
    dbClient: DbClient;
    id: string;
    examId: string;
    roomId?: string | null;
    instructorId?: string | null;
    scheduledAt?: string | Date | null;
}) {
    const { dbClient, id, examId, roomId, instructorId, scheduledAt } = args;

    const updateValues: Record<string, any> = {
        updated_at: new Date(),
    };

    if (roomId !== undefined) {
        updateValues.room_id = roomId;
    }
    if (instructorId !== undefined) {
        updateValues.instructor_id = instructorId;
    }
    if (scheduledAt !== undefined) {
        updateValues.scheduled_at = scheduledAt ? new Date(scheduledAt) : null;
    }

    return (await dbClient
        .updateTable('exam_section_assignments' as any)
        .set(updateValues)
        .where('id', '=', id)
        .where('exam_id', '=', examId)
        .returning([
            'id',
            'exam_id as examId',
            'section_id as sectionId',
            'room_id as roomId',
            'instructor_id as instructorId',
            'scheduled_at as scheduledAt',
            'created_at as createdAt',
            'updated_at as updatedAt',
        ])
        .executeTakeFirstOrThrow()) as any;
}
