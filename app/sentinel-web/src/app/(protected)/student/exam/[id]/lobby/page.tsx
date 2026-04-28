'use client';

import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { useLobbyPresence } from './_hooks/use-lobby-presence';
import { useLobbyState } from './_hooks/use-lobby-state';
import { LobbyHeader } from './_components/lobby-header';
import { LobbyLayout } from './_components/lobby-layout';
import { LobbyFooterActions } from './_components/lobby-footer-actions';

export default function StudentExamLobbyPage() {
    const { examId, exam, configuration, mediaPipeSandbox, refetchExam, isLoading } =
        useStudentExamData();
    const { presenceCount } = useLobbyPresence(examId);

    const {
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
    } = useLobbyState({
        examId,
        exam,
        configuration,
        mediaPipeSandbox,
        refetchExam,
    });

    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
        runtimeAccess: exam?.runtimeAccess,
    });

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    return (
        <StudentFlowShell>
            <div>
                <LobbyHeader
                    duration={exam?.duration ?? 0}
                    presenceCount={presenceCount}
                    maxReconnectAttempts={configuration.maxReconnectAttempts}
                    runtimeAccess={runtimeAccess}
                    hasCompletedFlow={hasCompletedFlow}
                />

                <LobbyLayout
                    hasCompletedFlow={hasCompletedFlow}
                    accessMessage={runtimeAccess?.message}
                    countdownLabel={countdownLabel}
                    mediaPipeLobbyMessage={mediaPipeLobbyMessage}
                    runtimeAccess={runtimeAccess}
                    reopenedUntil={reopenedUntil}
                />

                <LobbyFooterActions
                    examId={examId}
                    isStartingSession={isStartingSession || isAdmissionPendingRefresh}
                    runtimeAccess={runtimeAccess}
                    storedSession={storedSession}
                    hasCompletedFlow={hasCompletedFlow}
                    canEnterExam={canEnterExam}
                    onEnterExam={handleEnterExam}
                />
            </div>
        </StudentFlowShell>
    );
}
