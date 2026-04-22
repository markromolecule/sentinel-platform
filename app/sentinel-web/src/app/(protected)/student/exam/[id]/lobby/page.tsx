'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@sentinel/hooks';
import { startExamSession } from '@sentinel/services';
import { isMediaPipeRuntimeEnabled } from '@sentinel/shared';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import {
    buildStudentExamHref,
    readStoredStudentExamFlow,
    resolveStoredStudentExamMediaPipeActivation,
    resolveStudentExamMediaPipeSandbox,
} from '../_lib/student-exam-flow';
import { useLobbyPresence } from './_hooks/use-lobby-presence';
import {
    clearStoredExamSession,
    readStoredExamSession,
    writeStoredExamSession,
} from '../_lib/exam-session-storage';
import { clearStoredExamTurnInPreview } from '../_lib/exam-turn-in-storage';
import {
    getStudentExamSessionAttemptId,
    isStudentExamAlreadyTurnedInError,
    resolveStudentExamSessionError,
} from '../_lib/student-exam-session-feedback';
import { PreviewPageHeader } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-page-header';
import { PreviewHighlightsList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/cards/preview-highlights-list';
import { ReadinessList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/lists/readiness-list';
import { PreviewFooterActions } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-footer-actions';
import {
    COMMON_HIGHLIGHT_ICONS,
    LOBBY_READINESS_ITEMS,
} from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants';

function formatCountdown(milliseconds: number) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}

function getLobbyStateLabel(runtimeAccess?: ExamRuntimeAccess | null, hasCompletedFlow?: boolean) {
    if (runtimeAccess?.canResume) {
        return 'Resume active attempt';
    }

    switch (runtimeAccess?.state) {
        case 'before_start':
            return 'Read-only until start';
        case 'locked':
            return 'Locked by instructor';
        case 'reopened':
            return 'Reopened access';
        case 'closed':
            return 'Closed';
        case 'open':
            return hasCompletedFlow ? 'Ready for entry' : 'Pending checks';
        default:
            return hasCompletedFlow ? 'Ready for entry' : 'Pending checks';
    }
}

export default function StudentExamLobbyPage() {
    const router = useRouter();
    const apiClient = useApi();
    const { examId, exam, configuration, mediaPipeSandbox, isLoading } = useStudentExamData();
    const { presenceCount } = useLobbyPresence(examId);
    const [isStartingSession, setIsStartingSession] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => Date.now());
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
        runtimeAccess: exam?.runtimeAccess,
    });
    const effectiveMediaPipeSandbox = useMemo(
        () =>
            resolveStudentExamMediaPipeSandbox({
                configuration,
                mediaPipeSandbox,
            }),
        [configuration, mediaPipeSandbox],
    );

    const storedFlow = useMemo(() => readStoredStudentExamFlow(examId), [examId, currentTime]);
    const requiresAttemptMediaPipeActivation = useMemo(
        () =>
            isMediaPipeRuntimeEnabled({
                sandbox: effectiveMediaPipeSandbox,
                configuration,
                stage: 'attempt',
                runtimeAccessAllowed: true,
            }),
        [configuration, effectiveMediaPipeSandbox],
    );
    const mediaPipeActivation = useMemo(
        () =>
            resolveStoredStudentExamMediaPipeActivation({
                examId,
                required: requiresAttemptMediaPipeActivation,
                nowMs: currentTime,
            }),
        [currentTime, examId, requiresAttemptMediaPipeActivation],
    );
    const hasCompletedFlow = useMemo(
        () =>
            storedFlow.privacyAccepted &&
            storedFlow.checkupCompleted &&
            mediaPipeActivation.isValid,
        [mediaPipeActivation.isValid, storedFlow.checkupCompleted, storedFlow.privacyAccepted],
    );

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => window.clearInterval(timerId);
    }, []);

    const totalChecks = 2;
    const readyCount = hasCompletedFlow ? totalChecks : 0;
    const storedSession = useMemo(() => readStoredExamSession(examId), [examId]);
    const runtimeAccess = exam?.runtimeAccess;
    const startsAt = runtimeAccess?.startsAt ? new Date(runtimeAccess.startsAt) : null;
    const reopenedUntil = runtimeAccess?.reopenedUntil
        ? new Date(runtimeAccess.reopenedUntil)
        : null;
    const hasCountdown =
        runtimeAccess?.state === 'before_start' &&
        startsAt &&
        !Number.isNaN(startsAt.getTime()) &&
        startsAt.getTime() > currentTime;
    const countdownLabel =
        hasCountdown && startsAt ? formatCountdown(startsAt.getTime() - currentTime) : null;
    const canEnterExam = Boolean(runtimeAccess?.canStart || runtimeAccess?.canResume);
    const accessMessage = runtimeAccess?.message ?? null;
    const mediaPipeLobbyMessage =
        mediaPipeActivation.status === 'missing'
            ? 'Return to checkup first so MediaPipe can finish activation before the attempt starts.'
            : mediaPipeActivation.status === 'stale'
              ? 'Your MediaPipe checkup activation expired. Run the checkup again before entering the attempt.'
              : null;

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    const highlights = [
        {
            label: 'Duration',
            value: `${exam?.duration ?? 0} minutes`,
            icon: COMMON_HIGHLIGHT_ICONS.DurationLobby,
        },
        {
            label: 'Lobby Count',
            value: `${presenceCount} students`,
            icon: COMMON_HIGHLIGHT_ICONS.LobbyCount,
        },
        {
            label: 'Reconnect',
            value: `${configuration.maxReconnectAttempts} attempts`,
            icon: COMMON_HIGHLIGHT_ICONS.Reconnect,
        },
        {
            label: 'Exam State',
            value: getLobbyStateLabel(runtimeAccess, hasCompletedFlow),
            icon: COMMON_HIGHLIGHT_ICONS.ExamState,
        },
    ];

    const handleEnterExam = async () => {
        if (!hasCompletedFlow || !canEnterExam) {
            if (!canEnterExam && accessMessage) {
                toast.error(accessMessage);
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
            }

            if (configuration.webSecurity.full_screen_required) {
                const fullscreenRequest = document.documentElement.requestFullscreen?.();
                await fullscreenRequest?.catch(() => null);
            }

            router.push(buildStudentExamHref(examId, 'attempt'));
        } catch (error) {
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
        } finally {
            setIsStartingSession(false);
        }
    };

    return (
        <StudentFlowShell>
            <div>
                <section className="space-y-4 border-b pb-6 sm:space-y-5 sm:pb-8">
                    <PreviewPageHeader
                        title="Lobby"
                        description="This is the final waiting area before the live attempt begins."
                    />

                    <PreviewHighlightsList highlights={highlights} />
                </section>

                <section className="grid items-stretch gap-4 py-6 sm:gap-5 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:gap-8 xl:gap-10">
                    <div className="border-border/60 bg-background flex h-full flex-col space-y-4 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <h2 className="text-base font-semibold sm:text-lg">Lobby status</h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-6 sm:text-[15px]">
                            <p>
                                Students who completed orientation, consent, and device checkup are
                                directed here before entering the live exam.
                            </p>
                            <p>
                                The lobby confirms that the environment is ready and that the exam
                                can continue into the actual attempt screen.
                            </p>
                            <p>
                                Current readiness: {readyCount}/{totalChecks} completed.
                            </p>
                        </div>
                    </div>

                    <div className="border-border/60 bg-background flex h-full flex-col space-y-4 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <h2 className="text-base font-semibold sm:text-lg">Before entry</h2>
                        <ReadinessList items={LOBBY_READINESS_ITEMS} />

                        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                            <p className="text-blue-800/80 dark:text-blue-200/80">
                                <span className="font-semibold">Note:</span> Entering from this step
                                starts or resumes your actual exam session.
                            </p>
                            {accessMessage ? (
                                <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                                    {accessMessage}
                                </p>
                            ) : null}
                            {countdownLabel ? (
                                <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                                    Countdown to access: {countdownLabel}
                                </p>
                            ) : null}
                            {mediaPipeLobbyMessage ? (
                                <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                                    {mediaPipeLobbyMessage}
                                </p>
                            ) : null}
                            {runtimeAccess?.state === 'reopened' && reopenedUntil ? (
                                <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                                    Reopened until {reopenedUntil.toLocaleString()}.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    primaryLabel={
                        isStartingSession
                            ? 'Preparing Exam Session'
                            : runtimeAccess?.canResume
                              ? 'Resume Exam'
                              : runtimeAccess?.state === 'closed'
                                ? 'Exam Closed'
                                : runtimeAccess?.state === 'locked'
                                  ? 'Exam Locked'
                                  : runtimeAccess?.state === 'before_start'
                                    ? 'Awaiting Start Time'
                                    : storedSession
                                      ? 'Resume Exam'
                                      : 'Continue to Attempt'
                    }
                    primaryDisabled={!hasCompletedFlow || isStartingSession || !canEnterExam}
                    primaryOnClick={handleEnterExam}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildStudentExamHref(examId, 'checkup')}
                />
            </div>
        </StudentFlowShell>
    );
}
