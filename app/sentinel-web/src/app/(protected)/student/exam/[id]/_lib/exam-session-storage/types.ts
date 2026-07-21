import type { StartExamSessionResult } from '@sentinel/services';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

export type StoredExamSession = {
    examId: string;
    sessionId: string;
    attemptId?: string;
    configSnapshot?: StartExamSessionResult['configSnapshot'];
    isResumed?: boolean;
    storedAt: string;
};

export type SecurityLockReason =
    'focus-loss' | 'fullscreen-exit' | 'right-click' | 'screen-capture';

export type StoredSecurityLock = {
    examId: string;
    reason: SecurityLockReason;
};

export type StoredExamAnswerDraft = {
    examId: string;
    sessionId: string;
    answers: Record<string, ExamAnswerValue>;
    elapsedSeconds: number;
    storedAt: string;
};

/**
 * Represents a one-time token issued in the lobby upon starting or resuming an exam.
 * Must be consumed on initial attempt route load.
 */
export type StoredLobbyEntryRecord = {
    version: 1;
    examId: string;
    sessionId?: string;
    token: string;
    createdAt: string;
    consumedAt?: string | null;
};

/**
 * Valid triggers for an exam session interruption requiring lobby reconnect confirmation.
 */
export type ReconnectReason = 'reload' | 'close' | 'offline' | 'navigation';

/**
 * Represents an unconfirmed reconnect intent logged prior to page interruption.
 */
export type StoredReconnectIntentRecord = {
    version: 1;
    examId: string;
    sessionId?: string;
    reason: ReconnectReason;
    createdAt: string;
};

