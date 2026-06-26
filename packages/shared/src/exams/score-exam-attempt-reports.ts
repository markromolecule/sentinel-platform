import {
    isCorrectAnswer,
    resolveQuestionCorrectAnswer,
} from './score-exam-attempt-answer-resolvers';
import type {
    BuildExamAttemptQuestionReportsArgs,
    ExamAttemptQuestionReport,
} from './score-exam-attempt.types';

/**
 * Builds item-level report data for an exam attempt so instructor and student
 * report views can render answers, correct answers, and awarded points from
 * one shared helper.
 *
 * @param args - Questions, submitted answers, and optional essay evaluations
 * @returns Question-by-question grading report data in exam order
 */
export function buildExamAttemptQuestionReports(
    args: BuildExamAttemptQuestionReportsArgs,
): ExamAttemptQuestionReport[] {
    const { questions, answers, evaluations = {}, itemOverrides = {} } = args;

    return questions.map((question) => {
        const answer = answers[question.id];
        const isCorrect = isCorrectAnswer(question, answer);
        const evaluation = evaluations[question.id] ?? null;
        const itemOverride = itemOverrides[question.id] ?? null;
        const awardedScore =
            typeof itemOverride?.awardedScore === 'number'
                ? itemOverride.awardedScore
                : isCorrect === null
                  ? typeof evaluation?.score === 'number'
                      ? evaluation.score
                      : null
                  : isCorrect
                    ? question.points
                    : 0;

        return {
            questionId: question.id,
            questionType: question.type,
            prompt: question.content.prompt,
            answer,
            correctAnswer: resolveQuestionCorrectAnswer(question),
            isCorrect,
            awardedScore,
            maxScore: question.points,
            evaluation,
            override: itemOverride,
        };
    });
}
