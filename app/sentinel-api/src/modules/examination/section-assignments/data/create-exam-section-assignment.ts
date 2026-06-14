import { type DbClient } from '@sentinel/db';

export async function createExamSectionAssignment(args: {
    dbClient: DbClient;
    examId: string;
    sectionId: string;
    roomId?: string | null;
    instructorId?: string | null;
    scheduledAt?: string | Date | null;
}) {
    const { dbClient, examId, sectionId, roomId, instructorId, scheduledAt } = args;

    return (await dbClient
        .insertInto('exam_section_assignments' as any)
        .values({
            exam_id: examId,
            section_id: sectionId,
            room_id: roomId || null,
            instructor_id: instructorId || null,
            scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
            updated_at: new Date(),
        })
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
