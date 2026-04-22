'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mic, Monitor, ScanFace, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Progress, Card } from '@sentinel/ui';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { useCheckupMediaPipe } from '../_hooks/use-checkup-mediapipe';
import { useStudentCheckupManager } from '../_hooks/use-student-checkup-manager';
import { PreviewPageHeader } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-page-header';
import { ReadinessList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/lists/readiness-list';
import { PreviewFooterActions } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-footer-actions';
import { CHECKUP_READINESS_ITEMS } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants';
import { DevicePreviewPanel } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/checkup/device-preview-panel';
import { CheckupStatusCard } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/checkup/checkup-status-card';
import { PreviewHighlightsList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/cards/preview-highlights-list';
import {
    buildStudentExamHref,
    patchStoredStudentExamFlow,
    resolveStudentExamMediaPipeSandbox,
} from '../_lib/student-exam-flow';

function formatCalibrationHoldDuration(seconds: number) {
    if (seconds <= 0) {
        return '0 seconds';
    }

    const rounded = Number.isInteger(seconds) ? seconds.toFixed(0) : seconds.toFixed(1);
    return `${rounded} second${seconds === 1 ? '' : 's'}`;
}

export default function StudentExamCheckupPage() {
    const router = useRouter();
    const { examId, exam, configuration, mediaPipeSandbox, isLoading } = useStudentExamData();

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
    const isCalibrationPending = isMediaPipeConfigured && !isCalibrated;
    const isMediaPipeReady = !isMediaPipeConfigured || (isCalibrated && !isCalibrationPending);
    const isCheckupReady = isDeviceCheckupReady && isMediaPipeReady;

    const highlights = [
        {
            label: 'Camera',
            value: configuration.cameraRequired ? 'Required' : 'Optional',
            icon: Camera,
        },
        {
            label: 'Microphone',
            value: configuration.micRequired ? 'Required' : 'Optional',
            icon: Mic,
        },
        {
            label: 'Browser',
            value: 'Verified',
            icon: ShieldCheck,
        },
        ...(isMediaPipeConfigured
            ? [
                  {
                      label: 'Biometrics',
                      value: 'Calibration',
                      icon: ScanFace,
                  },
              ]
            : []),
    ];

    const checks = [
        {
            label: 'Camera',
            description: configuration.cameraRequired
                ? 'Required for face visibility during the exam.'
                : 'Not required for this exam.',
            state: configuration.cameraRequired ? cameraState : 'granted',
            icon: Camera,
        },
        {
            label: 'Microphone',
            description: configuration.micRequired
                ? 'Required for room audio monitoring.'
                : 'Not required for this exam.',
            state: configuration.micRequired ? micState : 'granted',
            icon: Mic,
        },
        {
            label: 'Fullscreen',
            description: configuration.webSecurity.full_screen_required
                ? 'Strictly enforced to prevent unauthorized tab switching.'
                : 'Fullscreen is not required for this exam.',
            state: configuration.webSecurity.full_screen_required ? 'idle' : 'granted',
            icon: Monitor,
        },
        ...(isMediaPipeConfigured
            ? [
                  {
                      label: 'Identity Scan',
                      description: 'A stable face scan ensures secure session ownership.',
                      state: isCalibrated ? ('granted' as const) : ('idle' as const),
                      icon: ScanFace,
                  },
              ]
            : []),
    ] as const;

    const calibrationHoldDurationLabel = formatCalibrationHoldDuration(
        calibrationHoldSecondsRemaining,
    );

    useEffect(() => {
        const hasCompletedMediaPipeActivation = isCheckupReady && isMediaPipeConfigured;

        patchStoredStudentExamFlow(examId, {
            checkupCompleted: isCheckupReady,
            mediaPipeActivatedAt: hasCompletedMediaPipeActivation ? new Date().toISOString() : null,
            mediaPipeCalibrationCompletedAt: hasCompletedMediaPipeActivation
                ? new Date().toISOString()
                : null,
            mediaPipeActivationSource: hasCompletedMediaPipeActivation ? 'checkup' : null,
        });
    }, [examId, isCheckupReady, isMediaPipeConfigured]);

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    return (
        <StudentFlowShell maxWidthClassName="max-w-7xl">
            <div className="flex flex-col gap-8">
                {/* Header Section */}
                <section className="border-border/60 space-y-6 border-b pb-8">
                    <PreviewPageHeader
                        title="System Checkup"
                        description="Verify your device permissions and environmental readiness before entering the lobby."
                    />
                    <PreviewHighlightsList
                        highlights={highlights}
                        columns={isMediaPipeConfigured ? 4 : 3}
                    />
                </section>

                {/* Main Content Grid */}
                <section className="grid items-start gap-10 lg:grid-cols-[280px_1fr_280px]">
                    {/* Left Panel: Status */}
                    <div className="animate-in fade-in slide-in-from-left-4 flex flex-col gap-6 duration-500">
                        <div className="flex items-center gap-2 px-1">
                            <ShieldCheck className="text-primary h-4 w-4" />
                            <h2 className="text-muted-foreground/80 text-[11px] font-bold tracking-[0.2em] uppercase">
                                Readiness Status
                            </h2>
                        </div>
                        <CheckupStatusCard checks={checks} />
                    </div>

                    {/* Center Panel: Camera Preview & Calibration */}
                    <div className="animate-in fade-in zoom-in-95 flex flex-col gap-8 duration-500">
                        <DevicePreviewPanel
                            videoRef={videoRef}
                            overlayCanvasRef={overlayCanvasRef}
                            streamActive={isStreamActive}
                            isRequesting={isRequesting}
                            errorMessage={errorMessage}
                            onRequestAccess={requestDeviceAccess}
                            className="w-full"
                        />

                        {/* Integrated Calibration Feedback */}
                        {isMediaPipeConfigured && isStreamActive && (
                            <div className="border-border/40 bg-background/50 animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-4 rounded-2xl border p-6 shadow-sm transition-all">
                                <div className="flex items-center justify-between">
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
                                    <div className="space-y-4">
                                        <Progress
                                            value={calibrationProgress}
                                            className="h-1.5 rounded-full"
                                        />
                                        <p className="text-foreground/90 text-center text-sm font-medium">
                                            {mediaPipeAnalysis?.status === 'ready'
                                                ? `Please stay still for ${calibrationHoldDurationLabel}...`
                                                : 'Center your face in the guide to begin calibration'}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Your identity has been verified. You are now ready to
                                        continue to the lobby.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Requirements */}
                    <div className="animate-in fade-in slide-in-from-right-4 flex flex-col gap-6 duration-500">
                        <div className="flex items-center gap-2 px-1">
                            <Monitor className="text-primary h-4 w-4" />
                            <h2 className="text-muted-foreground/80 text-[11px] font-bold tracking-[0.2em] uppercase">
                                Requirements
                            </h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="border-border/40 bg-background/50 rounded-2xl border p-6 shadow-sm">
                                <ReadinessList items={CHECKUP_READINESS_ITEMS} />
                            </div>

                            <div className="rounded-xl border border-blue-100/50 bg-blue-50/40 p-4 dark:border-blue-900/20 dark:bg-blue-900/10">
                                <div className="mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    <span className="text-[9px] font-bold tracking-widest text-blue-800/70 uppercase dark:text-blue-200/70">
                                        Privacy Note
                                    </span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-200/80">
                                    Biometric data is processed locally and discarded after the
                                    session ends.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    primaryLabel={isCalibrationPending ? 'Finalizing Setup' : 'Continue to Lobby'}
                    primaryDisabled={!isCheckupReady}
                    primaryOnClick={() => router.push(buildStudentExamHref(examId, 'lobby'))}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildStudentExamHref(examId, 'privacy')}
                />
            </div>
        </StudentFlowShell>
    );
}
