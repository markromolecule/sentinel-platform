import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@sentinel/hooks';
import { startExamSession, syncExamProgress } from '@sentinel/services';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { toast } from 'sonner';
import {
    readStoredExamAnswerDraft,
    clearStoredExamSession,
    readStoredExamSession,
    writeStoredExamAnswerDraft,
    writeStoredExamSession,
    type StoredExamSession,
} from '../_lib/exam-session-storage';
import {
    clearStoredExamTurnInPreview,
    readStoredExamTurnInPreview,
} from '../_lib/exam-turn-in-storage';
import {
    getStudentExamSessionAttemptId,
    isStudentExamAlreadyTurnedInError,
    resolveStudentExamSessionError,
} from '../_lib/student-exam-session-feedback';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

type UseExamSessionArgs = {
    examId: string;
    examDurationMinutes?: number;
    runtimeAccess?: ExamRuntimeAccess | null;
    isLoadingData?: boolean;
    isSessionStartBlocked?: boolean;
    onInitializeAnswers?: (answers: Record<string, ExamAnswerValue>) => void;
    onInitializeElapsedSeconds?: (seconds: number) => void;
};

export function useExamSession({
    examId,
    examDurationMinutes,
    runtimeAccess,
    isLoadingData,
    isSessionStartBlocked,
    onInitializeAnswers,
    onInitializeElapsedSeconds,
}: UseExamSessionArgs) {
    const router = useRouter();
    const apiClient = useApi();
    const [examSession, setExamSession] = useState<StoredExamSession | null>(null);
    const [isInitializingSession, setIsInitializingSession] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const storedSession = readStoredExamSession(examId);
        setExamSession(storedSession);
        const pendingTurnInPreview = readStoredExamTurnInPreview(examId);

        if (pendingTurnInPreview) {
            onInitializeAnswers?.(pendingTurnInPreview.answers as Record<string, ExamAnswerValue>);
            onInitializeElapsedSeconds?.(pendingTurnInPreview.elapsedSeconds);
            setElapsedSeconds(pendingTurnInPreview.elapsedSeconds);
        } else if (storedSession?.sessionId) {
            const answerDraft = readStoredExamAnswerDraft(examId, storedSession.sessionId);

            if (answerDraft) {
                onInitializeAnswers?.(answerDraft.answers);
                onInitializeElapsedSeconds?.(answerDraft.elapsedSeconds);
                setElapsedSeconds(answerDraft.elapsedSeconds);
            }
        }

        setIsInitializingSession(false);
    }, [examId, onInitializeAnswers, onInitializeElapsedSeconds]);

    useEffect(() => {
        if (!examDurationMinutes) {
            return;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds((current) => current + 1);
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [examDurationMinutes]);

    useEffect(() => {
        if (isLoadingData || isInitializingSession) {
            return;
        }

        if (runtimeAccess && examSession && !runtimeAccess.canResume && !runtimeAccess.canStart) {
            clearStoredExamSession(examId);
            setExamSession(null);
            toast.error(runtimeAccess.message);
            router.replace(`/student/exam/${examId}/lobby`);
            return;
        }

        if (runtimeAccess && !examSession && !runtimeAccess.canStart && !runtimeAccess.canResume) {
            clearStoredExamSession(examId);
            toast.error(runtimeAccess.message);
            router.replace(`/student/exam/${examId}/lobby`);
            return;
        }
    }, [examId, examSession, isInitializingSession, isLoadingData, router, runtimeAccess]);

    useEffect(() => {
        if (isLoadingData || examSession || isInitializingSession || isSessionStartBlocked) {
            return;
        }

        if (runtimeAccess && !runtimeAccess.canStart && !runtimeAccess.canResume) {
            return;
        }

        let isActive = true;
        setIsInitializingSession(true);

        const initializeExamSession = async () => {
            try {
                const session = await startExamSession(apiClient, { examId });
                const storedSession = writeStoredExamSession(examId, session);

                if (!storedSession) {
                    throw new Error('Exam session could not be initialized.');
                }

                if (session.answers) {
                    writeStoredExamAnswerDraft({
                        examId,
                        sessionId: storedSession.sessionId,
                        answers: session.answers as Record<string, ExamAnswerValue>,
                        elapsedSeconds: session.elapsedSeconds ?? 0,
                    });
                }

                if (isActive) {
                    setExamSession(storedSession);

                    if (session.answers) {
                        const restoredAnswers = session.answers as Record<string, ExamAnswerValue>;
                        const restoredElapsedSeconds = session.elapsedSeconds ?? 0;

                        onInitializeAnswers?.(restoredAnswers);
                        onInitializeElapsedSeconds?.(restoredElapsedSeconds);
                        setElapsedSeconds(restoredElapsedSeconds);
                    }
                }
            } catch (error) {
                if (!isActive) {
                    return;
                }

                if (isStudentExamAlreadyTurnedInError(error)) {
                    const attemptId = getStudentExamSessionAttemptId(error);

                    clearStoredExamTurnInPreview(examId);
                    clearStoredExamSession(examId);

                    if (attemptId) {
                        router.replace(`/student/history/details?attemptId=${attemptId}`);
                        return;
                    }
                }

                toast.error(resolveStudentExamSessionError(error));
                clearStoredExamSession(examId);
                router.replace(`/student/exam/${examId}/lobby`);
            } finally {
                if (isActive) {
                    setIsInitializingSession(false);
                }
            }
        };

        void initializeExamSession();

        return () => {
            isActive = false;
        };
    }, [
        apiClient,
        examId,
        examSession,
        isInitializingSession,
        isLoadingData,
        isSessionStartBlocked,
        onInitializeAnswers,
        onInitializeElapsedSeconds,
        router,
        runtimeAccess,
    ]);

    const secondsRemaining = Math.max((examDurationMinutes ?? 0) * 60 - elapsedSeconds, 0);

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
        [examId, examSession?.sessionId],
    );

    const syncProgress = useCallback(
        async (
            answeredCount: number,
            answers?: Record<string, ExamAnswerValue>,
            nextElapsedSeconds = elapsedSeconds,
        ) => {
            if (!examSession?.sessionId) {
                return;
            }

            if (answers) {
                saveAnswerDraft(answers, nextElapsedSeconds);
            }

            try {
                await syncExamProgress(apiClient, {
                    sessionId: examSession.sessionId,
                    answeredCount,
                    elapsedSeconds: nextElapsedSeconds,
                    answers,
                });
            } catch (error) {
                console.error('Failed to sync exam progress:', error);
            }
        },
        [apiClient, elapsedSeconds, examSession?.sessionId, saveAnswerDraft],
    );

    return {
        examSession,
        isInitializingSession,
        elapsedSeconds,
        secondsRemaining,
        setElapsedSeconds,
        saveAnswerDraft,
        syncProgress,
    };
}
