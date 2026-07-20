'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mic, ScanFace, CheckCircle2 } from 'lucide-react';
import { Progress } from '@sentinel/ui';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { useCheckupMediaPipe } from '../_hooks/use-checkup-mediapipe';
import { useStudentCheckupManager } from '../_hooks/use-student-checkup-manager';
import {
    buildStudentExamHref,
    patchStoredStudentExamFlow,
    resolveStoredStudentExamCheckupReadiness,
    resolveStudentExamMediaPipeSandbox,
} from '../_lib/student-exam-flow';
import { MonitoringPreloader } from '../_components/monitoring-preloader';
import {
    StudentFlowCheckupStatusCard,
    StudentFlowDevicePreviewPanel,
    StudentFlowFooterActions,
    StudentFlowPageHeader,
    StudentFlowPanel,
} from '../../_components/student-flow-primitives';

function formatCalibrationHoldDuration(seconds: number) {
    if (seconds <= 0) {
        return '0 seconds';
    }

    const rounded = Number.isInteger(seconds) ? seconds.toFixed(0) : seconds.toFixed(1);
    return `${rounded} second${seconds === 1 ? '' : 's'}`;
}

export default function StudentExamCheckupPage() {
    const router = useRouter();
    const { examId, exam, blockedState, configuration, mediaPipeSandbox, isLoading } =
        useStudentExamData();

    const effectiveMediaPipeSandbox = useMemo(
        () =>
            resolveStudentExamMediaPipeSandbox({
                configuration,
                mediaPipeSandbox,
            }),
        [configuration, mediaPipeSandbox],
    );

    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
        runtimeAccess: exam?.runtimeAccess,
    });

    const {
        videoRef,
        cameraState,
        micState,
        isRequesting,
        isStreamActive,
        errorMessage,
        isCheckupReady: isDeviceCheckupReady,
        requestDeviceAccess,
    } = useStudentCheckupManager({ configuration });

    const {
        overlayCanvasRef,
        analysis: mediaPipeAnalysis,
        calibrationProgress,
        calibrationHoldSecondsRemaining,
        calibrationProfile,
        isCalibrated,
    } = useCheckupMediaPipe({
        videoRef,
        streamActive: isStreamActive,
        configuration,
        mediaPipeSandbox: effectiveMediaPipeSandbox,
    });

    const isMediaPipeConfigured = Boolean(
        effectiveMediaPipeSandbox.enabled && effectiveMediaPipeSandbox.captureDuringCheckup,
    );
    const storedCheckupReadiness = useMemo(
        () =>
            resolveStoredStudentExamCheckupReadiness({
                examId,
                requiresMediaPipeActivation: isMediaPipeConfigured,
            }),
        [examId, isMediaPipeConfigured],
    );
    const isCalibrationPending = isMediaPipeConfigured && !isCalibrated;
    const isMediaPipeReady = !isMediaPipeConfigured || (isCalibrated && !isCalibrationPending);
    const isCheckupReady = isDeviceCheckupReady && isMediaPipeReady;
    const isPersistedCheckupReady = storedCheckupReadiness.isReady;
    const isRestoringPersistedCheckup = isPersistedCheckupReady && !isCheckupReady;
    const effectiveCameraState =
        configuration.cameraRequired && isRestoringPersistedCheckup ? 'granted' : cameraState;
    const effectiveMicState =
        configuration.micRequired && isRestoringPersistedCheckup ? 'granted' : micState;
    const effectiveIdentityState = isRestoringPersistedCheckup
        ? ('granted' as const)
        : isCalibrated
          ? ('granted' as const)
          : ('idle' as const);
    const isCheckupFlowReady = isCheckupReady || isPersistedCheckupReady;

    const handleRequestDeviceAccess = useCallback(() => {
        patchStoredStudentExamFlow(examId, {
            checkupCompleted: false,
            mediaPipeActivatedAt: null,
            mediaPipeCalibrationCompletedAt: null,
            mediaPipeActivationSource: null,
            mediaPipeCalibrationProfile: null,
        });
        requestDeviceAccess();
    }, [examId, requestDeviceAccess]);

    const checks = [
        {
            label: 'Camera',
            description: configuration.cameraRequired
                ? 'Required for face visibility during the exam.'
                : 'Not required for this exam.',
            state: configuration.cameraRequired ? effectiveCameraState : 'granted',
            icon: Camera,
        },
        {
            label: 'Microphone',
            description: configuration.micRequired
                ? 'Required for room audio monitoring.'
                : 'Not required for this exam.',
            state: configuration.micRequired ? effectiveMicState : 'granted',
            icon: Mic,
        },
        ...(isMediaPipeConfigured
            ? [
                  {
                      label: 'Identity Scan',
                      description: 'A stable face scan ensures secure session ownership.',
                      state: effectiveIdentityState,
                      icon: ScanFace,
                  },
              ]
            : []),
    ] as const;

    const calibrationHoldDurationLabel = formatCalibrationHoldDuration(
        calibrationHoldSecondsRemaining,
    );
    const currentStatusLabel = isCheckupFlowReady
        ? 'Ready for lobby'
        : isCalibrationPending
          ? 'Calibrating identity'
          : isDeviceCheckupReady
            ? 'Waiting for final checks'
            : 'Device access required';
    const currentStatusDescription = isCheckupFlowReady
        ? isRestoringPersistedCheckup
            ? 'Your previous device and identity verification are still valid. Continue to the lobby, or grant device access again to rerun the checkup.'
            : 'Your device and monitoring setup are ready. You can continue to the lobby.'
        : isCalibrationPending
          ? mediaPipeAnalysis?.status === 'ready'
              ? `Hold steady for ${calibrationHoldDurationLabel} to complete the scan.`
              : 'Center your face in the camera guide so the identity scan can begin.'
          : isDeviceCheckupReady
            ? 'Finish the remaining setup steps before continuing.'
            : 'Grant the required device permissions before the exam can proceed.';

    useEffect(() => {
        if (!isCheckupReady) {
            return;
        }

        const hasCompletedMediaPipeActivation = isMediaPipeConfigured;

        patchStoredStudentExamFlow(examId, {
            checkupCompleted: true,
            mediaPipeActivatedAt: hasCompletedMediaPipeActivation ? new Date().toISOString() : null,
            mediaPipeCalibrationCompletedAt: hasCompletedMediaPipeActivation
                ? new Date().toISOString()
                : null,
            mediaPipeActivationSource: hasCompletedMediaPipeActivation ? 'checkup' : null,
            mediaPipeCalibrationProfile: hasCompletedMediaPipeActivation
                ? calibrationProfile
                : null,
        });
    }, [calibrationProfile, examId, isCheckupReady, isMediaPipeConfigured]);

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    if (blockedState.isBlocked) {
        return (
            <StudentFlowShell
                maxWidthClassName="max-w-5xl"
                mainClassName="py-5 sm:py-6"
                contentClassName="my-auto"
            >
                <div className="flex min-h-full flex-col justify-center gap-5">
                    <StudentFlowPageHeader
                        title={blockedState.title ?? 'Exam Unavailable'}
                        description={
                            blockedState.message ?? 'This exam cannot be entered right now.'
                        }
                    />
                </div>
            </StudentFlowShell>
        );
    }

    return (
        <StudentFlowShell
            maxWidthClassName="max-w-5xl"
            mainClassName="py-5 sm:py-6"
            contentClassName="my-auto"
        >
            <div className="flex min-h-full flex-col justify-center gap-5">
                <MonitoringPreloader configuration={configuration} />
                <section className="border-border/60 space-y-3 border-b pb-4 sm:space-y-4 sm:pb-5">
                    <div className="flex items-center justify-end">
                        <span className="text-primary text-[11px] font-semibold tracking-[0.22em] uppercase">
                            Step 3 of 4
                        </span>
                    </div>
                    <StudentFlowPageHeader
                        title="System Checkup"
                        description="Complete your device and identity checks here before the lobby opens."
                    />
                </section>

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
                    <StudentFlowPanel className="space-y-4">
                        <div className="space-y-1.5 text-center">
                            <h2 className="text-xl font-semibold sm:text-2xl">
                                {currentStatusLabel}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                                {currentStatusDescription}
                            </p>
                        </div>

                        <StudentFlowDevicePreviewPanel
                            videoRef={videoRef}
                            overlayCanvasRef={overlayCanvasRef}
                            streamActive={isStreamActive}
                            isRequesting={isRequesting}
                            errorMessage={errorMessage}
                            onRequestAccess={handleRequestDeviceAccess}
                            className="mx-auto w-full max-w-xl items-center text-center"
                            supplementaryContent={
                                isMediaPipeConfigured && isStreamActive ? (
                                    <div className="flex w-full flex-col gap-2 border-t pt-3">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="flex items-center gap-2">
                                                {isCalibrated ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                                                )}
                                                <p className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase">
                                                    {isCalibrated
                                                        ? 'Calibration Successful'
                                                        : mediaPipeAnalysis?.status === 'ready'
                                                          ? 'Holding Position'
                                                          : 'Awaiting Alignment'}
                                                </p>
                                            </div>
                                            {!isCalibrated && (
                                                <span className="text-primary font-mono text-[10px] font-medium">
                                                    {calibrationProgress}%
                                                </span>
                                            )}
                                        </div>

                                        {!isCalibrated ? (
                                            <div className="space-y-2">
                                                <Progress
                                                    value={calibrationProgress}
                                                    className="h-1.5 rounded-full"
                                                />
                                                <p className="text-foreground/90 text-center text-sm leading-5 font-medium">
                                                    {mediaPipeAnalysis?.status === 'ready'
                                                        ? `Please stay still for ${calibrationHoldDurationLabel}...`
                                                        : 'Center your face in the guide to begin calibration'}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center text-sm leading-relaxed">
                                                Your identity has been verified. You are now ready
                                                to continue to the lobby.
                                            </p>
                                        )}
                                    </div>
                                ) : null
                            }
                        />
                    </StudentFlowPanel>

                    <StudentFlowPanel className="space-y-3">
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold sm:text-lg">Readiness status</h2>
                            <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                                Complete the required checks before continuing to the lobby.
                            </p>
                        </div>

                        {configuration.cameraRequired ? (
                            <p className="text-muted-foreground rounded-2xl border px-4 py-3 text-sm leading-6">
                                During the active exam, an authorized proctor may view your camera
                                live if a live inspection is requested. This does not publish
                                microphone audio and does not record the session.
                            </p>
                        ) : null}

                        <StudentFlowCheckupStatusCard checks={checks} />
                    </StudentFlowPanel>
                </section>

                <StudentFlowFooterActions
                    primaryLabel={
                        isCheckupFlowReady
                            ? 'Continue to Lobby'
                            : isCalibrationPending
                              ? 'Finalizing Setup'
                              : 'Continue to Lobby'
                    }
                    primaryDisabled={!isCheckupFlowReady}
                    primaryOnClick={() => router.push(buildStudentExamHref(examId, 'lobby'))}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildStudentExamHref(examId, 'privacy')}
                />
            </div>
        </StudentFlowShell>
    );
}
