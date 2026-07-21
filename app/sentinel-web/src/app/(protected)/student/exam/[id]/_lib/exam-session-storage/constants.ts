export const EXAM_SESSION_STORAGE_PREFIX = 'sentinel-web:exam-session';
export const EXAM_ANSWER_DRAFT_STORAGE_PREFIX = 'sentinel-web:exam-answer-draft';
export const EXAM_LOBBY_ENTRY_STORAGE_PREFIX = 'sentinel-web:exam-lobby-entry';
export const EXAM_RECONNECT_INTENT_STORAGE_PREFIX = 'sentinel-web:exam-reconnect-intent';

/**
 * Builds the storage key for an exam session record.
 */
export function buildExamSessionStorageKey(examId: string) {
    return `${EXAM_SESSION_STORAGE_PREFIX}:${examId}`;
}

/**
 * Builds the storage key for an exam answer draft record.
 */
export function buildExamAnswerDraftStorageKey(examId: string) {
    return `${EXAM_ANSWER_DRAFT_STORAGE_PREFIX}:${examId}`;
}

/**
 * Builds the storage key for a versioned lobby-entry record.
 */
export function buildExamLobbyEntryStorageKey(examId: string) {
    return `${EXAM_LOBBY_ENTRY_STORAGE_PREFIX}:${examId}`;
}

/**
 * Builds the storage key for an unconfirmed reconnect intent record.
 */
export function buildExamReconnectIntentStorageKey(examId: string) {
    return `${EXAM_RECONNECT_INTENT_STORAGE_PREFIX}:${examId}`;
}

