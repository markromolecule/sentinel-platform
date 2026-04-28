import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import type { StoredExamSession } from '../../_lib/exam-session-storage';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

export type UseExamSessionArgs = {
    examId: string;
    examDurationMinutes?: number;
    runtimeAccess?: ExamRuntimeAccess | null;
    isLoadingData?: boolean;
    isSessionStartBlocked?: boolean;
    onInitializeAnswers?: (answers: Record<string, ExamAnswerValue>) => void;
    onInitializeElapsedSeconds?: (seconds: number) => void;
};

export type UseExamSessionResult = {
    examSession: StoredExamSession | null;
    isInitializingSession: boolean;
    elapsedSeconds: number;
    secondsRemaining: number;
    setElapsedSeconds: (seconds: number | ((current: number) => number)) => void;
    saveAnswerDraft: (answers: Record<string, ExamAnswerValue>, nextElapsedSeconds: number) => void;
    syncProgress: (
        answeredCount: number,
        answers?: Record<string, ExamAnswerValue>,
        nextElapsedSeconds?: number,
    ) => Promise<void>;
};
