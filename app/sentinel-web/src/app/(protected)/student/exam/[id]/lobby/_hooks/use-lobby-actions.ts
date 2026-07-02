import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@sentinel/hooks';
import { startExamSession } from '@sentinel/services';
import { toast } from 'sonner';

import { buildStudentExamHref } from '../../_lib/student-exam-flow';
import {
    clearStoredExamSession,
    writeStoredExamAnswerDraft,
    writeStoredExamSession,
    writeStoredLobbyEntryMarker,
} from '../../_lib/exam-session-storage';
import { clearStoredExamTurnInPreview } from '../../_lib/exam-turn-in-storage';
import {
    getStudentExamSessionAttemptId,
    isStudentExamAlreadyTurnedInError,
    resolveStudentExamSessionError,
} from '../../_lib/student-exam-session-feedback';
import type { ExamConfig, ExamRuntimeAccess } from '@sentinel/shared/types';
import { type StoredExamSession } from '../../_lib/exam-session-storage';
import { buildStudentHistoryAttemptHref } from '@/lib/routes/student-history-routes';

export type UseLobbyActionsArgs = {
    examId: string;
    configuration: ExamConfig;
    runtimeAccess?: ExamRuntimeAccess | null;
    storedSession?: StoredExamSession | null;
    hasCompletedFlow: boolean;
    canEnterExam: boolean;
};

export function useLobbyActions({
    examId,
    configuration,
    runtimeAccess,
    storedSession,
    hasCompletedFlow,
    canEnterExam,
}: UseLobbyActionsArgs) {
    const router = useRouter();
    const apiClient = useApi();
    const [isStartingSession, setIsStartingSession] = useState(false);

    const handleEnterExam = async () => {
        if (!hasCompletedFlow || !canEnterExam) {
            if (!canEnterExam && runtimeAccess?.message) {
                toast.error(runtimeAccess.message);
            }
            return;
        }

        setIsStartingSession(true);

        try {
            if (!storedSession) {
                const session = await startExamSession(apiClient, { examId });
                const nextStoredSession = writeStoredExamSession(examId, session);

                if (!nextStoredSession) {
                    toast.error('Exam session could not be initialized.');
                    return;
                }

                if (session.answers) {
                    writeStoredExamAnswerDraft({
                        examId,
                        sessionId: nextStoredSession.sessionId,
                        answers: session.answers,
                        elapsedSeconds: session.elapsedSeconds ?? 0,
                    });
                }
            }

            if (configuration.webSecurity.full_screen_required) {
                await document.documentElement.requestFullscreen?.()?.catch(() => null);
            }

            writeStoredLobbyEntryMarker(examId);
            router.push(buildStudentExamHref(examId, 'attempt'));
        } catch (error) {
            if (isStudentExamAlreadyTurnedInError(error)) {
                const attemptId = getStudentExamSessionAttemptId(error);
                clearStoredExamTurnInPreview(examId);
                clearStoredExamSession(examId);
                if (attemptId) {
                    router.replace(buildStudentHistoryAttemptHref(attemptId));
                    return;
                }
            }
            toast.error(resolveStudentExamSessionError(error));
        } finally {
            setIsStartingSession(false);
        }
    };

    return {
        isStartingSession,
        handleEnterExam,
    };
}
