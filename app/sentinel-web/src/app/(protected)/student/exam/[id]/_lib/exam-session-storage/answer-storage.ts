import type { ExamAnswerValue } from '@/features/exams/_components/engine';
import { buildExamAnswerDraftStorageKey } from './constants';
import type { StoredExamAnswerDraft } from './types';

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
