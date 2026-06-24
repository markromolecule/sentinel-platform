import { type DbClient } from '@sentinel/db';

/**
 * Creates a single exam section assignment and persists the selected classroom
 * identity when one is provided by the client.
 */
export async function createExamSectionAssignment(args: {
    dbClient: DbClient;
    examId: string;
    sectionId: string;
    classGroupId?: string | null;
    roomId?: string | null;
    instructorId?: string | null;
    scheduledAt?: string | Date | null;
}) {
    const { dbClient, examId, sectionId, classGroupId, roomId, instructorId, scheduledAt } = args;

    return (await dbClient
        .insertInto('exam_section_assignments' as any)
        .values({
            exam_id: examId,
            section_id: sectionId,
            class_group_id: classGroupId || null,
            room_id: roomId || null,
            instructor_id: instructorId || null,
            scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
            updated_at: new Date(),
        })
        .returning([
            'id',
            'exam_id as examId',
            'section_id as sectionId',
            'class_group_id as classGroupId',
            'room_id as roomId',
            'instructor_id as instructorId',
            'scheduled_at as scheduledAt',
            'created_at as createdAt',
            'updated_at as updatedAt',
        ])
        .executeTakeFirstOrThrow()) as any;
}
