import type { ExamQuestion } from '@sentinel/shared/types';

import type { ExamEngineMode } from './types';

export function formatQuestionTypeLabel(type: ExamQuestion['type']) {
    return type.replaceAll('_', ' ');
}

export function getQuestionPrompt(question: ExamQuestion) {
    return question.content.prompt || 'Question prompt unavailable.';
}

export function isPreviewMode(mode: ExamEngineMode) {
    return mode === 'preview';
}
