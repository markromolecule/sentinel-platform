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
        case 'TRUE_FALSE': {
            const correctAnswer =
                coerceBoolean(contentRecord.correctAnswer) ??
                coerceBoolean(contentRecord.answer) ??
                coerceBoolean(contentRecord.isTrue);

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
    }

    return contentRecord;
}
