import { useEffect, useState } from 'react';
import { useApi } from '@sentinel/hooks';
import { checkIntoExamLobby, getExamLobbyAdmissionStatus } from '@sentinel/services';
import { readStoredExamSession } from '../../_lib/exam-session-storage';
import { useLobbyTimer } from './use-lobby-timer';
import { useLobbyMediaPipe } from './use-lobby-mediapipe';
import { useLobbyReadiness } from './use-lobby-readiness';
import { useLobbyActions } from './use-lobby-actions';
import type { ExamConfig, ExamData } from '@sentinel/shared/types';
import type { StudentExamMediaPipeSandboxLike } from '../../_lib/student-exam-flow';

export function useLobbyState(args: {
    examId: string;
    exam?: ExamData | null;
    configuration: ExamConfig;
    mediaPipeSandbox: StudentExamMediaPipeSandboxLike;
    refetchExam: () => Promise<unknown>;
}) {
    const { examId, exam, configuration, mediaPipeSandbox, refetchExam } = args;
    const apiClient = useApi();
    const [isAdmissionPendingRefresh, setIsAdmissionPendingRefresh] = useState(false);

    // 1. Core Timer
    const { currentTime, countdownLabel } = useLobbyTimer(exam?.runtimeAccess);

    // 2. MediaPipe Status
    const { mediaPipeActivation, mediaPipeLobbyMessage } = useLobbyMediaPipe({
        examId,
        configuration,
        mediaPipeSandbox,
        currentTime,
    });

    // 3. Readiness Tracking
    const { hasCompletedFlow } = useLobbyReadiness({
        examId,
        isMediaPipeValid: mediaPipeActivation.isValid,
    });

    // 4. Derived Access State
    const runtimeAccess = exam?.runtimeAccess;
    const canEnterExam = Boolean(runtimeAccess?.canStart || runtimeAccess?.canResume);
    const reopenedUntil = runtimeAccess?.reopenedUntil
        ? new Date(runtimeAccess.reopenedUntil)
        : null;
    const storedSession = readStoredExamSession(examId);
    const requiresInstructorAdmission =
        configuration.lobbyAdmissionMode === 'INSTRUCTOR_GATED' && !runtimeAccess?.canResume;

    useEffect(() => {
        if (!requiresInstructorAdmission || runtimeAccess?.canStart) {
            setIsAdmissionPendingRefresh(false);
            return;
        }

        let isMounted = true;
        let intervalId: number | null = null;

        const refreshApprovedAccess = async () => {
            setIsAdmissionPendingRefresh(true);
            await refetchExam();
        };

        const syncAdmission = async (skipCheckIn = false) => {
            const admission = skipCheckIn
                ? await getExamLobbyAdmissionStatus(apiClient, examId)
                : await checkIntoExamLobby(apiClient, examId);

            if (!isMounted) {
                return;
            }

            if (admission.status === 'APPROVED') {
                await refreshApprovedAccess();
            }
        };

        void syncAdmission();
        intervalId = window.setInterval(() => {
            void syncAdmission(true);
        }, 5000);

        return () => {
            isMounted = false;

            if (intervalId !== null) {
                window.clearInterval(intervalId);
            }
        };
    }, [apiClient, examId, refetchExam, requiresInstructorAdmission, runtimeAccess?.canStart]);

    // 5. Actions Orchestration
    const { isStartingSession, handleEnterExam } = useLobbyActions({
        examId,
        configuration,
        runtimeAccess,
        storedSession,
        hasCompletedFlow,
        canEnterExam,
    });

    return {
        currentTime,
        countdownLabel,
        hasCompletedFlow,
        runtimeAccess,
        canEnterExam,
        reopenedUntil,
        storedSession,
        mediaPipeLobbyMessage,
        isStartingSession,
        isAdmissionPendingRefresh,
        handleEnterExam,
    };
}
