import { type DbClient } from '@sentinel/db';

export async function createFeedbackData(
    dbClient: DbClient,
    values: {
        attempt_id: string;
        exam_id?: string | null;
        student_id?: string | null;
        institution_id?: string | null;
        rating: number;
        experience?: string | null;
    },
) {
    return await dbClient
        .insertInto('exam_feedbacks')
        .values({
            attempt_id: values.attempt_id,
            exam_id: values.exam_id ?? null,
            student_id: values.student_id ?? null,
            institution_id: values.institution_id ?? null,
            rating: values.rating,
            experience: values.experience ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}
