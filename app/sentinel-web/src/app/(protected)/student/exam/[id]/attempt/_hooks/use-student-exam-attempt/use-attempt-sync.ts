import { useEffect, useRef } from 'react';
import { type ExamAnswerValue, hasAnswer } from '@/features/exams/_components/engine';
import { SYNC_PROGRESS_DEBOUNCE_MS } from './_constants';

export type UseAttemptSyncArgs = {
    isInitializingSession: boolean;
    sessionId?: string;
    elapsedSeconds: number;
    selectedAnswers: Record<string, ExamAnswerValue>;
    saveAnswerDraft: (answers: Record<string, ExamAnswerValue>, elapsedSeconds: number) => void;
    syncProgress: (
        answeredCount: number,
        answers: Record<string, ExamAnswerValue>,
        elapsedSeconds: number,
    ) => Promise<void>;
};

export function useAttemptSync({
    isInitializingSession,
    sessionId,
    elapsedSeconds,
    selectedAnswers,
    saveAnswerDraft,
    syncProgress,
}: UseAttemptSyncArgs) {
    const elapsedSecondsRef = useRef(elapsedSeconds);

    useEffect(() => {
        elapsedSecondsRef.current = elapsedSeconds;
    }, [elapsedSeconds]);

    useEffect(() => {
        if (isInitializingSession || !sessionId) {
            return;
        }

        const answeredCount = Object.values(selectedAnswers).filter(hasAnswer).length;

        // Skip saving empty answers immediately after initialization to prevent race conditions
        // where the hook state hasn't yet received the restored draft answers.
        if (Object.keys(selectedAnswers).length > 0) {
            saveAnswerDraft(selectedAnswers, elapsedSecondsRef.current);
        }

        const timer = setTimeout(() => {
            void syncProgress(answeredCount, selectedAnswers, elapsedSecondsRef.current);
        }, SYNC_PROGRESS_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [sessionId, isInitializingSession, saveAnswerDraft, selectedAnswers, syncProgress]);
}
