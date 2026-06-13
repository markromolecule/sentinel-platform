import type { ExamQuestion } from '@sentinel/shared/types';

import type { ExamAnswerValue, ExamEngineMode } from './types';

export function isPreviewMode(mode: ExamEngineMode) {
    return mode === 'preview';
}

export function formatQuestionTypeLabel(type: ExamQuestion['type']) {
    return type.replaceAll('_', ' ');
}

export function getQuestionPrompt(question: ExamQuestion) {
    return question.content.prompt || 'Question prompt unavailable.';
}

export function hasAnswer(value: ExamAnswerValue) {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'string') {
        return value.trim().length > 0;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some((item) =>
            typeof item === 'string' ? item.trim().length > 0 : item !== null && item !== undefined,
        );
    }

    if (typeof value === 'object') {
        return Object.values(value).some((item) =>
            typeof item === 'string' ? item.trim().length > 0 : item !== null && item !== undefined,
        );
    }

    return false;
}

export function formatTimer(totalSeconds: number) {
    const safeSeconds = Math.max(totalSeconds, 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
        return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
    }

    return [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function getExamContextDetails({
    questionBody,
    questionSourceFileName,
    questionSourcePageNumber,
    examDescription,
}: {
    questionBody?: string | null;
    questionSourceFileName?: string | null;
    questionSourcePageNumber?: number | null;
    examDescription?: string | null;
}) {
    const passageBody = questionBody?.trim() ?? '';
    const fallbackBody = examDescription?.trim() ?? '';

    if (passageBody) {
        return {
            title: questionSourceFileName ? questionSourceFileName : 'Passage',
            description:
                questionSourcePageNumber !== null && questionSourcePageNumber !== undefined
                    ? `Reference excerpt from page ${questionSourcePageNumber}.`
                    : 'Use this reference passage to evaluate the current question.',
            body: passageBody,
        };
    }

    if (fallbackBody) {
        return {
            title: 'Exam context',
            description: 'This exam does not attach a dedicated passage for the current question.',
            body: fallbackBody,
        };
    }

    return {
        title: 'Question context',
        description:
            'No separate passage is attached to this item yet. The question panel will still work at full width.',
        body: '',
    };
}
