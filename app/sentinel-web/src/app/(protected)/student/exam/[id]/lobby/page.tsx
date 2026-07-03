'use client';

import { useEffect } from 'react';
import { useExamLobbyCountQuery } from '@sentinel/hooks';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { useLobbyState } from './_hooks/use-lobby-state';
import { useLobbyPresence } from './_hooks/use-lobby-presence';
import { LobbyHeader } from './_components/lobby-header';
import { LobbyLayout } from './_components/lobby-layout';
import { LobbyFooterActions } from './_components/lobby-footer-actions';
import { MonitoringPreloader } from '../_components/monitoring-preloader';

export default function StudentExamLobbyPage() {
    const {
        examId,
        exam,
        blockedState,
        configuration,
        mediaPipeSandbox,
        refetchExam,
        isLoading,
    } = useStudentExamData();
    const {
        data: lobbyCount,
        isError,
        refetch: refetchLobbyCount,
    } = useExamLobbyCountQuery(examId);
    const { presenceCount } = useLobbyPresence(examId);

    const displayCount =
        typeof lobbyCount?.count === 'number'
            ? lobbyCount.count
            : presenceCount > 0
              ? presenceCount
              : isError
                ? 'Unavailable'
                : 'Syncing';

    const {
        countdownLabel,
        hasCompletedFlow,
        runtimeAccess,
        canEnterExam,
        reopenedUntil,
        storedSession,
        mediaPipeLobbyMessage,
        admissionStatus,
        isStartingSession,
        handleEnterExam,
    } = useLobbyState({
        examId,
        exam,
        configuration,
        mediaPipeSandbox,
        refetchExam,
    });

    useEffect(() => {
        if (!admissionStatus) {
            return;
        }

        void refetchLobbyCount();
    }, [admissionStatus, refetchLobbyCount]);

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
                <MonitoringPreloader configuration={configuration} />
                <LobbyHeader
                    duration={exam?.duration ?? 0}
                    presenceCount={displayCount}
                    maxReconnectAttempts={configuration.maxReconnectAttempts}
                    runtimeAccess={runtimeAccess}
                    hasCompletedFlow={hasCompletedFlow}
                />

                <LobbyLayout
                    hasCompletedFlow={hasCompletedFlow}
                    accessMessage={blockedState.isBlocked ? blockedState.message : runtimeAccess?.message}
                    countdownLabel={countdownLabel}
                    maxReconnectAttempts={configuration.maxReconnectAttempts}
                    mediaPipeLobbyMessage={mediaPipeLobbyMessage}
                    runtimeAccess={runtimeAccess}
                    reopenedUntil={reopenedUntil}
                />

                <LobbyFooterActions
                    examId={examId}
                    isStartingSession={isStartingSession}
                    runtimeAccess={runtimeAccess}
                    admissionStatus={admissionStatus}
                    storedSession={storedSession}
                    hasCompletedFlow={hasCompletedFlow}
                    canEnterExam={canEnterExam}
                    onEnterExam={handleEnterExam}
                />
            </div>
        </StudentFlowShell>
    );
}
