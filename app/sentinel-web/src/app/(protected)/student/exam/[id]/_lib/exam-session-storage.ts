import type { StartExamSessionResult } from '@sentinel/services';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

const EXAM_SESSION_STORAGE_PREFIX = 'sentinel-web:exam-session';
const EXAM_ANSWER_DRAFT_STORAGE_PREFIX = 'sentinel-web:exam-answer-draft';

export type StoredExamSession = {
    examId: string;
    sessionId: string;
    configSnapshot?: StartExamSessionResult['configSnapshot'];
    isResumed?: boolean;
    storedAt: string;
};

export type SecurityLockReason = 'focus-loss' | 'fullscreen-exit' | 'screen-capture';

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

function buildExamSessionStorageKey(examId: string) {
    return `${EXAM_SESSION_STORAGE_PREFIX}:${examId}`;
}

function buildExamAnswerDraftStorageKey(examId: string) {
    return `${EXAM_ANSWER_DRAFT_STORAGE_PREFIX}:${examId}`;
}

export function readStoredExamSession(examId: string): StoredExamSession | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const rawValue = window.sessionStorage.getItem(buildExamSessionStorageKey(examId));

    if (!rawValue) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(rawValue) as unknown;

        if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
            window.sessionStorage.removeItem(buildExamSessionStorageKey(examId));
            return null;
        }

        const record = parsedValue as Record<string, unknown>;

        if (typeof record.examId !== 'string' || typeof record.sessionId !== 'string') {
            window.sessionStorage.removeItem(buildExamSessionStorageKey(examId));
            return null;
        }

        return record as unknown as StoredExamSession;
    } catch {
        window.sessionStorage.removeItem(buildExamSessionStorageKey(examId));
        return null;
    }
}

export function writeStoredExamSession(
    examId: string,
    session: StartExamSessionResult,
): StoredExamSession | null {
    if (typeof window === 'undefined' || !session.sessionId) {
        return null;
    }

    const storedSession: StoredExamSession = {
        examId,
        sessionId: session.sessionId,
        configSnapshot: session.configSnapshot,
        isResumed: session.isResumed,
        storedAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(
        buildExamSessionStorageKey(examId),
        JSON.stringify(storedSession),
    );

    return storedSession;
}

export function clearStoredExamSession(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const sessionKey = buildExamSessionStorageKey(examId);
    const lockKey = `${sessionKey}:lock`;

    window.sessionStorage.removeItem(sessionKey);
    window.sessionStorage.removeItem(lockKey);
    window.localStorage.removeItem(buildExamAnswerDraftStorageKey(examId));
}

export function readStoredExamAnswerDraft(
    examId: string,
    sessionId?: string | null,
): StoredExamAnswerDraft | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const key = buildExamAnswerDraftStorageKey(examId);
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(rawValue) as unknown;

        if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
            window.localStorage.removeItem(key);
            return null;
        }

        const record = parsedValue as Record<string, unknown>;

        if (
            record.examId !== examId ||
            typeof record.sessionId !== 'string' ||
            (sessionId && record.sessionId !== sessionId) ||
            !record.answers ||
            typeof record.answers !== 'object' ||
            Array.isArray(record.answers)
        ) {
            window.localStorage.removeItem(key);
            return null;
        }

        return {
            examId,
            sessionId: record.sessionId,
            answers: record.answers as Record<string, ExamAnswerValue>,
            elapsedSeconds:
                typeof record.elapsedSeconds === 'number'
                    ? Math.max(0, Math.floor(record.elapsedSeconds))
                    : 0,
            storedAt:
                typeof record.storedAt === 'string' ? record.storedAt : new Date().toISOString(),
        };
    } catch {
        window.localStorage.removeItem(key);
        return null;
    }
}

export function writeStoredExamAnswerDraft(args: {
    examId: string;
    sessionId: string;
    answers: Record<string, ExamAnswerValue>;
    elapsedSeconds: number;
}) {
    if (typeof window === 'undefined') {
        return;
    }

    const draft: StoredExamAnswerDraft = {
        examId: args.examId,
        sessionId: args.sessionId,
        answers: args.answers,
        elapsedSeconds: Math.max(0, Math.floor(args.elapsedSeconds)),
        storedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(buildExamAnswerDraftStorageKey(args.examId), JSON.stringify(draft));
}

export function clearStoredExamAnswerDraft(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(buildExamAnswerDraftStorageKey(examId));
}

export function readStoredSecurityLock(examId: string): SecurityLockReason | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lock`;
    const value = window.sessionStorage.getItem(key);

    return value as SecurityLockReason | null;
}

export function writeStoredSecurityLock(examId: string, reason: SecurityLockReason) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lock`;
    window.sessionStorage.setItem(key, reason);
}

export function clearStoredSecurityLock(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const key = `${buildExamSessionStorageKey(examId)}:lock`;
    window.sessionStorage.removeItem(key);
}
