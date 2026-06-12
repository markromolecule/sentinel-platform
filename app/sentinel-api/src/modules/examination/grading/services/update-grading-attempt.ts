import { type DbClient } from '@sentinel/db';
import { calculateEssayWeightedScore, scoreExamAttempt } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { getGradingAttemptDetail } from './get-grading-attempt-detail';

export type UpdateGradingAttemptArgs = {
    dbClient: DbClient;
    attemptId: string;
    institutionId?: string;
    evaluations: Record<
        string,
        {
            scores: {
                contentSubstance: number;
                structureOrganization: number;
                argumentationSupport: number;
                styleTone: number;
                grammarConventions: number;
            };
            feedback?: string | null;
        }
    >;
    feedback?: string | null;
};

/**
 * Updates a student's exam attempt with manually scored essay questions,
 * recalculating the overall score and storing criteria breakdowns.
 *
 * @param args - UpdateGradingAttemptArgs
 * @returns The updated score and attempt information.
 */
export async function updateGradingAttempt({
    dbClient,
    attemptId,
    institutionId,
    evaluations,
    feedback,
}: UpdateGradingAttemptArgs) {
    // 1. Fetch current attempt details and questions
    const detail = await getGradingAttemptDetail({
        dbClient,
        attemptId,
        institutionId,
    });

    const { attempt, questions } = detail;

    // 2. Score the auto-gradable (objective) questions
    const mappedQuestions = questions.map((q) => ({
        id: q.id,
        examId: q.examId,
        type: q.type as any,
        points: q.points,
        orderIndex: q.orderIndex,
        content: q.content,
        tags: [],
    }));

    const summary = scoreExamAttempt({
        questions: mappedQuestions,
        answers: attempt.answers,
    });

    // Start with the auto-graded objective score
    let calculatedScore = summary.score;

    // Build the updated evaluations record
    const updatedEvaluations: Record<string, any> = {};

    // 3. Score the essay questions using the provided criteria scores
    for (const question of questions) {
        if (question.type === 'ESSAY') {
            const evaluation = evaluations[question.id];

            if (!evaluation) {
                throw new HTTPException(400, {
                    message: `Evaluation missing for essay question: ${question.id}`,
                });
            }

            const essayScore = calculateEssayWeightedScore(evaluation.scores, question.points);

            calculatedScore += essayScore;

            updatedEvaluations[question.id] = {
                scores: evaluation.scores,
                score: essayScore,
                feedback: evaluation.feedback ?? null,
            };
        }
    }

    // 4. Round the final score to nearest integer for DB compatibility (Int)
    const roundedScore = Math.round(calculatedScore);

    // 5. Build updated answer snapshot with metadata prefixed with "_"
    const updatedSnapshot = {
        ...attempt.answers,
        _evaluations: updatedEvaluations,
        _feedback: feedback ?? null,
    };

    // 6. Update the database
    await dbClient
        .updateTable('exam_attempts')
        .set({
            score: roundedScore,
            answer_snapshot: updatedSnapshot as any,
            last_synced_at: new Date(),
        })
        .where('attempt_id', '=', attemptId)
        .execute();

    return {
        attemptId,
        score: roundedScore,
        totalScore: attempt.totalScore,
    };
}
