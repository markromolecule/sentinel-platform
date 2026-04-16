import { ExamQuestion } from '@sentinel/shared/types';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';

/**
 * Transforms an AI-generated question into a standardized ExamQuestion format
 * for previewing and editing.
 */
export function transformAiQuestionToExamQuestion(
    index: number,
    previewData: GenerateQuestionPreviewResponse,
): ExamQuestion {
    const q = previewData.questions[index];
    const content = { ...q.content } as Record<string, unknown>;

    // 1. Ensure prompt field exists (some AI models use 'stem')
    if ('stem' in content && !('prompt' in content)) {
        content.prompt = content.stem;
    }

    // 2. Normalize options and correct answers
    const options = content.options;
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object') {
        const aiOptions = options as { text: string; isCorrect: boolean }[];

        // Extract text only for options array
        content.options = aiOptions.map((o) => o.text);

        // Normalize correctAnswer based on question type
        if (q.type === 'MULTIPLE_CHOICE') {
            content.correctAnswer = aiOptions.find((o) => o.isCorrect)?.text || '';
        } else if (q.type === 'MULTIPLE_RESPONSE') {
            content.correctAnswer = aiOptions.filter((o) => o.isCorrect).map((o) => o.text);
        }
    }

    return {
        ...q,
        id: `temp-${index}`,
        content,
    } as unknown as ExamQuestion;
}

/**
 * Calculates pagination details for the preview list.
 */
export function getPaginationIndices(currentPage: number, questionsPerPage: number) {
    const pageStartIndex = (currentPage - 1) * questionsPerPage;
    const pageEndIndex = pageStartIndex + questionsPerPage;
    return { pageStartIndex, pageEndIndex };
}
