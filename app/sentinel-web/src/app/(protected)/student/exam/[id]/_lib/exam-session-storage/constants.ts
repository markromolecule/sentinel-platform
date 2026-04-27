export const EXAM_SESSION_STORAGE_PREFIX = 'sentinel-web:exam-session';
export const EXAM_ANSWER_DRAFT_STORAGE_PREFIX = 'sentinel-web:exam-answer-draft';

export function buildExamSessionStorageKey(examId: string) {
    return `${EXAM_SESSION_STORAGE_PREFIX}:${examId}`;
}

export function buildExamAnswerDraftStorageKey(examId: string) {
    return `${EXAM_ANSWER_DRAFT_STORAGE_PREFIX}:${examId}`;
}
