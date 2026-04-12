import { Schema } from '@sentinel/shared';
import { z } from 'zod';
import { coerceBoolean, coerceString, coerceStringArray } from './coercion';

/**
 * Normalizes the internal structure of a question's content based on its type.
 * Maps Gemini-provided field names (e.g., 'stem', 'answer') to internal ones (e.g., 'prompt', 'correctAnswer').
 */
export function normalizeQuestionContentShape(
    type: z.infer<typeof Schema.questionTypeSchema>,
    content: unknown,
) {
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
        return content;
    }

    const contentRecord = { ...(content as Record<string, unknown>) };
    const prompt =
        coerceString(contentRecord.prompt) ??
        coerceString(contentRecord.stem) ??
        coerceString(contentRecord.question) ??
        coerceString(contentRecord.statement) ??
        coerceString(contentRecord.text);

    if (prompt) {
        contentRecord.prompt = prompt;
    }

    switch (type) {
        case 'MULTIPLE_CHOICE': {
            const options = coerceStringArray(contentRecord.options);
            if (options) {
                contentRecord.options = options;
            }

            const correctAnswer =
                coerceString(contentRecord.correctAnswerText) ??
                coerceString(contentRecord.correctAnswer) ??
                coerceString(contentRecord.answer);

            if (correctAnswer) {
                if (options) {
                    const match = options.find(
                        (opt) => opt.toLowerCase().trim() === correctAnswer.toLowerCase().trim(),
                    );
                    contentRecord.correctAnswer = match ?? correctAnswer;
                } else {
                    contentRecord.correctAnswer = correctAnswer;
                }
            }
            break;
        }
        case 'MULTIPLE_RESPONSE': {
            const options = coerceStringArray(contentRecord.options);
            if (options) {
                contentRecord.options = options;
            }

            const correctAnswerList =
                coerceStringArray(contentRecord.correctAnswerList) ??
                coerceStringArray(contentRecord.correctAnswer) ??
                coerceStringArray(contentRecord.answers);

            if (correctAnswerList) {
                if (options) {
                    contentRecord.correctAnswer = correctAnswerList.map((answer) => {
                        const match = options.find(
                            (opt) => opt.toLowerCase().trim() === answer.toLowerCase().trim(),
                        );
                        return match ?? answer;
                    });
                } else {
                    contentRecord.correctAnswer = correctAnswerList;
                }
            }
            break;
        }
        case 'TRUE_FALSE': {
            const correctAnswer =
                coerceBoolean(contentRecord.isTrue) ??
                coerceBoolean(contentRecord.correctAnswer) ??
                coerceBoolean(contentRecord.answer);

            if (typeof correctAnswer === 'boolean') {
                contentRecord.correctAnswer = correctAnswer;
            }
            break;
        }
        case 'IDENTIFICATION':
        case 'ENUMERATION': {
            const acceptedAnswers =
                coerceStringArray(contentRecord.acceptedAnswers) ??
                coerceStringArray(contentRecord.correctAnswer) ??
                coerceStringArray(contentRecord.answers) ??
                coerceStringArray(contentRecord.items);

            if (acceptedAnswers) {
                contentRecord.acceptedAnswers = acceptedAnswers;
            }
            break;
        }
        case 'FILL_BLANK': {
            const blanks =
                coerceStringArray(contentRecord.blanks) ??
                coerceStringArray(contentRecord.acceptedAnswers) ??
                coerceStringArray(contentRecord.correctAnswer) ??
                coerceStringArray(contentRecord.answers);

            if (blanks) {
                contentRecord.blanks = blanks;
            }
            break;
        }
        case 'MATCHING': {
            const pairs = contentRecord.pairs;
            if (Array.isArray(pairs)) {
                contentRecord.pairs = pairs
                    .map((pair: any) => ({
                        left:
                            coerceString(pair.left) ??
                            coerceString(pair.key) ??
                            coerceString(pair.question),
                        right:
                            coerceString(pair.right) ??
                            coerceString(pair.value) ??
                            coerceString(pair.answer),
                    }))
                    .filter((p: any) => p.left && p.right);
            }
            break;
        }
        case 'ESSAY': {
            const rubric = coerceString(contentRecord.rubric) ?? coerceString(contentRecord.guide);
            if (rubric) {
                contentRecord.rubric = rubric;
            }
            break;
        }
    }

    return contentRecord;
}
