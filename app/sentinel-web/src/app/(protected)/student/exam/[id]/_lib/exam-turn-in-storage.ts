import type { ExamAttemptAnswers, ExamAttemptScoreSummary } from '@sentinel/shared/types';

const EXAM_TURN_IN_STORAGE_PREFIX = 'sentinel-web:exam-turn-in-preview';

export type StoredExamTurnInPreview = {
    examId: string;
    sessionId: string;
    answers: ExamAttemptAnswers;
    elapsedSeconds: number;
    summary: ExamAttemptScoreSummary;
    storedAt: string;
};

function buildExamTurnInStorageKey(examId: string) {
    return `${EXAM_TURN_IN_STORAGE_PREFIX}:${examId}`;
}

export function readStoredExamTurnInPreview(examId: string): StoredExamTurnInPreview | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const rawValue = window.sessionStorage.getItem(buildExamTurnInStorageKey(examId));

    if (!rawValue) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(rawValue) as unknown;

        if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
            window.sessionStorage.removeItem(buildExamTurnInStorageKey(examId));
            return null;
        }

        const record = parsedValue as Record<string, unknown>;

        if (
            typeof record.examId !== 'string' ||
            typeof record.sessionId !== 'string' ||
            typeof record.elapsedSeconds !== 'number' ||
            !record.summary ||
            typeof record.summary !== 'object'
        ) {
            window.sessionStorage.removeItem(buildExamTurnInStorageKey(examId));
            return null;
        }

        return parsedValue as StoredExamTurnInPreview;
    } catch {
        window.sessionStorage.removeItem(buildExamTurnInStorageKey(examId));
        return null;
    }
}

export function writeStoredExamTurnInPreview(preview: StoredExamTurnInPreview) {
    if (typeof window === 'undefined') {
        return preview;
    }

    window.sessionStorage.setItem(
        buildExamTurnInStorageKey(preview.examId),
        JSON.stringify(preview),
    );

    return preview;
}

export function clearStoredExamTurnInPreview(examId: string) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.removeItem(buildExamTurnInStorageKey(examId));
}
