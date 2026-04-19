'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@sentinel/hooks';
import { startExamSession } from '@sentinel/services';
import { getExamArchiveCutoff } from '@sentinel/shared';
import { toast } from 'sonner';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { buildStudentExamHref, readStoredStudentExamFlow } from '../_lib/student-exam-flow';
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

export default function StudentExamLobbyPage() {
    const router = useRouter();
    const apiClient = useApi();
    const { examId, exam, configuration, isLoading } = useStudentExamData();
    const [isStartingSession, setIsStartingSession] = useState(false);
    const [hasCompletedFlow, setHasCompletedFlow] = useState(false);
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
    });

    useEffect(() => {
        const storedState = readStoredStudentExamFlow(examId);
        setHasCompletedFlow(storedState.privacyAccepted && storedState.checkupCompleted);
    }, [examId]);

    const totalChecks = 2;
    const readyCount = hasCompletedFlow ? totalChecks : 0;
    const storedSession = useMemo(() => readStoredExamSession(examId), [examId]);
    const startsAt = exam?.scheduledDate ? new Date(exam.scheduledDate) : null;
    const endsAt = getExamArchiveCutoff({
        scheduledDate: exam?.scheduledDate,
        endDateTime: exam?.endDateTime,
        durationMinutes: exam?.duration,
    });
    const now = new Date();
    const hasStarted = Boolean(
        startsAt && !Number.isNaN(startsAt.getTime()) && startsAt.getTime() <= now.getTime(),
    );
    const hasClosed = Boolean(endsAt && endsAt.getTime() <= now.getTime());
    const availabilityMessage = hasClosed
        ? 'This exam window has already closed.'
        : !hasStarted && startsAt
          ? `This exam will open on ${startsAt.toLocaleString()}.`
          : null;

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    const studentsInLobby = exam?.studentsCount ?? 0;
    const highlights = [
        {
            label: 'Duration',
            value: `${exam?.duration ?? 0} minutes`,
            icon: COMMON_HIGHLIGHT_ICONS.DurationLobby,
        },
        {
            label: 'Lobby Count',
            value: `${studentsInLobby} students`,
            icon: COMMON_HIGHLIGHT_ICONS.LobbyCount,
        },
        {
            label: 'Reconnect',
            value: `${configuration.maxReconnectAttempts} attempts`,
            icon: COMMON_HIGHLIGHT_ICONS.Reconnect,
        },
        {
            label: 'Exam State',
            value: availabilityMessage
                ? hasClosed
                    ? 'Closed'
                    : 'Scheduled'
                : hasCompletedFlow
                  ? 'Ready for entry'
                  : 'Pending checks',
            icon: COMMON_HIGHLIGHT_ICONS.ExamState,
        },
    ];

    const handleEnterExam = async () => {
        if (!hasCompletedFlow || availabilityMessage) {
            if (availabilityMessage) {
                toast.error(availabilityMessage);
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
                            {availabilityMessage ? (
                                <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                                    {availabilityMessage}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    primaryLabel={
                        isStartingSession
                            ? 'Preparing Exam Session'
                            : availabilityMessage
                              ? hasClosed
                                  ? 'Exam Closed'
                                  : 'Awaiting Start Time'
                              : storedSession
                                ? 'Resume Exam'
                                : 'Continue to Attempt'
                    }
                    primaryDisabled={
                        !hasCompletedFlow || isStartingSession || Boolean(availabilityMessage)
                    }
                    primaryOnClick={handleEnterExam}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildStudentExamHref(examId, 'checkup')}
                />
            </div>
        </StudentFlowShell>
    );
}
