import type { ExamAttemptScoreSummary } from '../types';
import { computePercentage, hasAnswerValue } from './score-exam-attempt-utils';
import { isCorrectAnswer } from './score-exam-attempt-answer-resolvers';
import type { ScoreExamAttemptArgs } from './score-exam-attempt.types';

/**
 * Scores an exam attempt across auto-gradable questions and returns the
 * aggregate score summary used throughout the exam flow.
 *
 * @param args - Questions and submitted answers for one attempt
 * @returns Aggregate score and review summary for the attempt
 */
export function scoreExamAttempt(args: ScoreExamAttemptArgs): ExamAttemptScoreSummary {
    const { questions, answers } = args;
    let score = 0;
    let answeredCount = 0;
    let autoGradableQuestionCount = 0;
    let manualReviewQuestionCount = 0;

    for (const question of questions) {
        const answerValue = answers[question.id];

        if (hasAnswerValue(answerValue)) {
            answeredCount += 1;
        }

        const correctness = isCorrectAnswer(question, answerValue);

        if (correctness === null) {
            manualReviewQuestionCount += 1;
            continue;
        }

        autoGradableQuestionCount += 1;

        if (correctness) {
            score += question.points;
        }
    }

    const totalScore = questions.reduce((sum, question) => sum + question.points, 0);

    return {
        score,
        totalScore,
        percentage: computePercentage(score, totalScore),
        answeredCount,
        autoGradableQuestionCount,
        manualReviewQuestionCount,
        requiresManualReview: manualReviewQuestionCount > 0,
    };
}
