import type { StartExamSessionResult } from '@sentinel/services';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

export type StoredExamSession = {
    examId: string;
    sessionId: string;
    configSnapshot?: StartExamSessionResult['configSnapshot'];
    isResumed?: boolean;
    storedAt: string;
};

export type SecurityLockReason =
    | 'focus-loss'
    | 'fullscreen-exit'
    | 'right-click'
    | 'screen-capture';

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
