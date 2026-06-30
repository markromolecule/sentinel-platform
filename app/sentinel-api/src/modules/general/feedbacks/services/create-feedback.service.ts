import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { CreateFeedbackSchemaValues, FeedbackRecord } from '@sentinel/shared/schema';
import { createFeedbackData } from '../data/create-feedback';
import { getFeedbackData } from '../data/get-feedback';

function serializeFeedbackRecord(row: Awaited<ReturnType<typeof getFeedbackData>>): FeedbackRecord {
    if (!row) {
        throw new HTTPException(404, { message: 'Feedback not found.' });
    }

    return {
        feedbackId: row.feedbackId,
        attemptId: row.attemptId,
        examId: row.examId ?? null,
        examTitle: row.examTitle ?? null,
        studentId: row.studentId ?? null,
        studentUserId: row.studentUserId ?? null,
        studentNumber: row.studentNumber ?? null,
        studentName: row.studentName ?? null,
        studentEmail: row.studentEmail ?? null,
        institutionId: row.institutionId ?? null,
        institutionName: row.institutionName ?? null,
        rating: row.rating,
        experience: row.experience ?? null,
        createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
}

export async function createFeedback(
    dbClient: DbClient,
    args: {
        userId: string;
        payload: CreateFeedbackSchemaValues;
    },
) {
    const student = await dbClient
        .selectFrom('students')
        .select(['student_id'])
        .where('user_id', '=', args.userId)
        .executeTakeFirst();

    if (!student) {
        throw new HTTPException(403, {
            message: 'Forbidden. Only students can submit feedback.',
        });
    }

    const ownedAttempt = await dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('students as s', 's.student_id', 'ea.student_id')
        .leftJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select([
            'ea.attempt_id as attemptId',
            'ea.completed_at as completedAt',
            'ea.exam_id as examId',
            'ea.student_id as studentId',
            'e.institution_id as institutionId',
        ])
        .where('ea.attempt_id', '=', args.payload.attemptId)
        .where('s.user_id', '=', args.userId)
        .executeTakeFirst();

    if (!ownedAttempt) {
        throw new HTTPException(404, { message: 'Completed attempt not found.' });
    }

    if (!ownedAttempt.completedAt) {
        throw new HTTPException(409, {
            message: 'Feedback can only be submitted for a completed attempt.',
        });
    }

    const existing = await dbClient
        .selectFrom('exam_feedbacks')
        .select(['feedback_id'])
        .where('attempt_id', '=', args.payload.attemptId)
        .executeTakeFirst();

    if (existing) {
        throw new HTTPException(409, {
            message: 'Feedback for this attempt has already been submitted.',
        });
    }

    const inserted = await createFeedbackData(dbClient, {
        attempt_id: args.payload.attemptId,
        exam_id: ownedAttempt.examId ?? null,
        student_id: ownedAttempt.studentId ?? null,
        institution_id: ownedAttempt.institutionId ?? null,
        rating: args.payload.rating,
        experience: args.payload.experience?.trim() || null,
    });

    const record = await getFeedbackData(dbClient, inserted.feedback_id);
    return serializeFeedbackRecord(record);
}

export { serializeFeedbackRecord };
