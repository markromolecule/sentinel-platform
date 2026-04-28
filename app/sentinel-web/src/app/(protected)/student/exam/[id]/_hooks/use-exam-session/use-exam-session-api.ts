import { useCallback } from 'react';
import { useApi } from '@sentinel/hooks';
import { syncExamProgress } from '@sentinel/services';
import { writeStoredExamAnswerDraft } from '../../_lib/exam-session-storage';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';
import type { StoredExamSession } from '../../_lib/exam-session-storage';

export function useExamSessionApi(args: { examId: string; examSession: StoredExamSession | null }) {
    const { examId, examSession } = args;
    const apiClient = useApi();

    const saveAnswerDraft = useCallback(
        (answers: Record<string, ExamAnswerValue>, nextElapsedSeconds: number) => {
            if (!examSession?.sessionId) {
                return;
            }

            writeStoredExamAnswerDraft({
                examId,
                sessionId: examSession.sessionId,
                answers,
                elapsedSeconds: nextElapsedSeconds,
            });
        },
        [examId, examSession],
    );

    const syncProgress = useCallback(
        async (
            answeredCount: number,
            elapsedSeconds: number,
            answers?: Record<string, ExamAnswerValue>,
        ) => {
            if (!examSession?.sessionId) {
                return;
            }

            if (answers) {
                saveAnswerDraft(answers, elapsedSeconds);
            }

            try {
                await syncExamProgress(apiClient, {
                    sessionId: examSession.sessionId,
                    answeredCount,
                    elapsedSeconds,
                    answers,
                });
            } catch (error) {
                console.error('Failed to sync exam progress:', error);
            }
        },
        [apiClient, examSession, saveAnswerDraft],
    );

    return {
        apiClient,
        saveAnswerDraft,
        syncProgress,
    };
}
