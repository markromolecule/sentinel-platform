import { type DbClient } from '@sentinel/db';
import type {
    ExamAttemptAnswers,
    ExamAttemptAnswerValue,
    ExamQuestion,
} from '@sentinel/shared/types';
import { scoreExamAttempt } from '@sentinel/shared';

export type QuestionPerformanceStat = {
    questionBankQuestionId: string;
    correctCount: number;
    totalAttempted: number;
};

/**
 * Computes per-question correctness statistics from COMPLETED exam attempts.
 *
 * Strategy:
 * 1. Load all COMPLETED attempts for any exam that contains the target question bank question IDs.
 * 2. For each attempt, walk the answer_snapshot and evaluate correctness for each question
 *    that maps to a tracked question_bank_question_id.
 * 3. Aggregate correct_count / total_attempted per question_bank_question_id.
 *
 * Note: ESSAY questions always produce `null` correctness (manual grade) and are excluded.
 */
export async function getQuestionPerformanceStats(args: {
    dbClient: DbClient;
    questionBankQuestionIds: string[];
}): Promise<QuestionPerformanceStat[]> {
    const { dbClient, questionBankQuestionIds } = args;

    if (questionBankQuestionIds.length === 0) {
        return [];
    }

    // Fetch all exam_questions that link back to the target QB questions,
    // along with the exam's COMPLETED attempt answer_snapshots.
    const rows = await dbClient
        .selectFrom('exam_questions as eq')
        .innerJoin('exam_attempts as ea', 'ea.exam_id', 'eq.exam_id')
        .select([
            'eq.question_id',
            'eq.source_question_bank_question_id',
            'eq.question_type',
            'eq.content',
            'eq.points',
            'ea.answer_snapshot',
        ])
        .where('eq.source_question_bank_question_id', 'in', questionBankQuestionIds)
        .where('ea.status', '=', 'COMPLETED')
        .where('ea.answer_snapshot', 'is not', null)
        .execute();

    // Group by question_bank_question_id
    const statsMap = new Map<string, { correctCount: number; totalAttempted: number }>();

    for (const row of rows) {
        const qbqId = row.source_question_bank_question_id;
        if (!qbqId) continue;

        const answerSnapshot = row.answer_snapshot as ExamAttemptAnswers | null;
        if (!answerSnapshot) continue;

        const studentAnswer: ExamAttemptAnswerValue = answerSnapshot[row.question_id];

        // Build a minimal ExamQuestion to pass to scoreExamAttempt's internal resolver
        const fakeQuestion: ExamQuestion = {
            id: row.question_id,
            examId: '',
            type: row.question_type as ExamQuestion['type'],
            points: Number(row.points),
            orderIndex: 0,
            tags: [],
            content: row.content as ExamQuestion['content'],
        };

        // Use existing scorer — null means ESSAY (manual grade), skip
        const summary = scoreExamAttempt({
            questions: [fakeQuestion],
            answers: { [row.question_id]: studentAnswer },
        });

        // If the question type is manual-graded only, skip
        if (summary.manualReviewQuestionCount > 0 && summary.autoGradableQuestionCount === 0) {
            continue;
        }

        if (!statsMap.has(qbqId)) {
            statsMap.set(qbqId, { correctCount: 0, totalAttempted: 0 });
        }

        const entry = statsMap.get(qbqId)!;
        entry.totalAttempted += 1;

        // A student scored points on this question = correct
        if (summary.score > 0) {
            entry.correctCount += 1;
        }
    }

    return Array.from(statsMap.entries()).map(([questionBankQuestionId, stat]) => ({
        questionBankQuestionId,
        ...stat,
    }));
}
