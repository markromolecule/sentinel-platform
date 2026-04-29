import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { startExamSession } from '@sentinel/services';
import { toast } from 'sonner';
import {
    clearStoredExamSession,
    writeStoredExamSession,
    writeStoredExamAnswerDraft,
} from '../../_lib/exam-session-storage';
import { clearStoredExamTurnInPreview } from '../../_lib/exam-turn-in-storage';
import {
    getStudentExamSessionAttemptId,
    isStudentExamAlreadyTurnedInError,
    resolveStudentExamSessionError,
} from '../../_lib/student-exam-session-feedback';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';
import { useExamTimer } from './use-exam-timer';
import { useExamSessionInitialization } from './use-exam-session-initialization';
import { useExamSessionApi } from './use-exam-session-api';
import type { UseExamSessionArgs, UseExamSessionResult } from './_types';

export function useExamSession({
    examId,
    examDurationMinutes,
    runtimeAccess,
    isLoadingData,
    isSessionStartBlocked,
    onInitializeAnswers,
    onInitializeElapsedSeconds,
}: UseExamSessionArgs): UseExamSessionResult {
    const router = useRouter();

    const { elapsedSeconds, setElapsedSeconds, secondsRemaining } =
        useExamTimer(examDurationMinutes);

    const { examSession, setExamSession, isInitializingSession, setIsInitializingSession } =
        useExamSessionInitialization({
            examId,
            onInitializeAnswers,
            onInitializeElapsedSeconds,
        });

    const { apiClient, saveAnswerDraft, syncProgress } = useExamSessionApi({
        examId,
        examSession,
    });

    // Handle access constraints
    useEffect(() => {
        if (isLoadingData || isInitializingSession) {
            return;
        }

        const isMissingSession =
            runtimeAccess && !examSession && !runtimeAccess.canStart && !runtimeAccess.canResume;

        if (isMissingSession) {
            clearStoredExamSession(examId);
            setExamSession(null);
            if (runtimeAccess?.message) {
                toast.error(runtimeAccess.message);
            }
            router.replace(`/student/exam/${examId}/lobby`);
        }
    }, [
        examId,
        examSession,
        isInitializingSession,
        isLoadingData,
        router,
        runtimeAccess,
        setExamSession,
    ]);

    // Initialize/Start API Session
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
                if (!isActive) return;

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
        setElapsedSeconds,
        setIsInitializingSession,
        setExamSession,
    ]);

    return {
        examSession,
        isInitializingSession,
        elapsedSeconds,
        secondsRemaining,
        setElapsedSeconds,
        saveAnswerDraft,
        syncProgress: (answeredCount, answers, nextElapsedSeconds = elapsedSeconds) =>
            syncProgress(answeredCount, nextElapsedSeconds, answers),
    };
}
