import { useCallback, useEffect, useRef, useState } from 'react';
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
    readStoredLobbyEntryMarker,
    clearStoredLobbyEntryMarker,
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
import { buildStudentHistoryAttemptHref } from '@/lib/routes/student-history-routes';

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
    const { replace } = useRouter();
    const apiClient = useApi();
    const isMountedRef = useRef(true);
    const sessionStartRequestRef = useRef(0);
    const [examSession, setExamSession] = useState<StoredExamSession | null>(null);
    const [isInitializingSession, setIsInitializingSession] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const processedLobbyEntryExamIdRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isAttemptPage = window.location.pathname.endsWith('/attempt');

        if (isAttemptPage && processedLobbyEntryExamIdRef.current === examId) {
            return;
        }

        const storedSession = readStoredExamSession(examId);
        const hasLobbyMarker = readStoredLobbyEntryMarker(examId);

        // If we have a valid session in storage, we are resuming/refreshing.
        // We skip the lobby marker check to prevent redirect loops.
        const isResuming = Boolean(storedSession?.sessionId);

        if (isAttemptPage && !hasLobbyMarker && !isResuming) {
            // Force redirect to lobby for reconnect confirmation
            clearStoredExamSession(examId);
            replace(`/student/exam/${examId}/lobby`);
            return;
        }

        // Consume the marker if it exists
        if (hasLobbyMarker) {
            clearStoredLobbyEntryMarker(examId);
        }

        if (isAttemptPage) {
            processedLobbyEntryExamIdRef.current = examId;
        }

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
    }, [examId, onInitializeAnswers, onInitializeElapsedSeconds, replace]);

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

        if (runtimeAccess && !examSession && !runtimeAccess.canStart && !runtimeAccess.canResume) {
            clearStoredExamSession(examId);
            toast.error(runtimeAccess.message);
            replace(`/student/exam/${examId}/lobby`);
            return;
        }
    }, [examId, examSession, isInitializingSession, isLoadingData, replace, runtimeAccess]);

    useEffect(() => {
        if (isLoadingData || examSession || isInitializingSession || isSessionStartBlocked) {
            return;
        }

        if (runtimeAccess && !runtimeAccess.canStart && !runtimeAccess.canResume) {
            return;
        }

        const requestId = sessionStartRequestRef.current + 1;
        sessionStartRequestRef.current = requestId;
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

                if (isMountedRef.current && sessionStartRequestRef.current === requestId) {
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
                if (!isMountedRef.current || sessionStartRequestRef.current !== requestId) {
                    return;
                }

                if (isStudentExamAlreadyTurnedInError(error)) {
                    const attemptId = getStudentExamSessionAttemptId(error);

                    clearStoredExamTurnInPreview(examId);
                    clearStoredExamSession(examId);

                    if (attemptId) {
                        replace(buildStudentHistoryAttemptHref(attemptId));
                        return;
                    }
                }

                toast.error(resolveStudentExamSessionError(error));
                clearStoredExamSession(examId);
                replace(`/student/exam/${examId}/lobby`);
            } finally {
                if (isMountedRef.current && sessionStartRequestRef.current === requestId) {
                    setIsInitializingSession(false);
                }
            }
        };

        void initializeExamSession();
    }, [
        apiClient,
        examId,
        examSession,
        isInitializingSession,
        isLoadingData,
        isSessionStartBlocked,
        onInitializeAnswers,
        onInitializeElapsedSeconds,
        replace,
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
