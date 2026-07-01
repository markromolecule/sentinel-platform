import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export async function getFeedbackData(dbClient: DbClient, feedbackId: string) {
    const studentEmailExpression = sql<
        string | null
    >`(select u.email from users as u where u.id = s.user_id limit 1)`;

    return await dbClient
        .selectFrom('exam_feedbacks as ef')
        .leftJoin('exam_attempts as ea', 'ea.attempt_id', 'ef.attempt_id')
        .leftJoin('exams as e', 'e.exam_id', 'ef.exam_id')
        .leftJoin('students as s', 's.student_id', 'ef.student_id')
        .leftJoin('user_profiles as up', 'up.user_id', 's.user_id')
        .leftJoin('institutions as i', 'i.id', 'ef.institution_id')
        .select([
            'ef.feedback_id as feedbackId',
            'ef.attempt_id as attemptId',
            'ef.exam_id as examId',
            'ef.student_id as studentId',
            'ef.institution_id as institutionId',
            'ef.rating',
            'ef.experience',
            'ef.created_at as createdAt',
            'ef.updated_at as updatedAt',
            'e.title as examTitle',
            's.user_id as studentUserId',
            's.student_number as studentNumber',
            'i.name as institutionName',
            studentEmailExpression.as('studentEmail'),
            sql<string | null>`nullif(trim(concat_ws(' ', up.first_name, up.last_name)), '')`.as(
                'studentName',
            ),
        ])
        .where('ef.feedback_id', '=', feedbackId)
        .executeTakeFirst();
}
