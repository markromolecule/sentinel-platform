'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mic, Monitor, ScanFace } from 'lucide-react';
import { Badge, Progress } from '@sentinel/ui';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { useCheckupMediaPipe } from '../_hooks/use-checkup-mediapipe';
import { PreviewPageHeader } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-page-header';
import { ReadinessList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/lists/readiness-list';
import { PreviewFooterActions } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-footer-actions';
import { CHECKUP_READINESS_ITEMS } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants';
import { useCheckupManager } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_hooks/use-checkup-manager';
import { DevicePreviewPanel } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/checkup/device-preview-panel';
import { CheckupStatusCard } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/checkup/checkup-status-card';
import { buildStudentExamHref, patchStoredStudentExamFlow } from '../_lib/student-exam-flow';

export default function StudentExamCheckupPage() {
    const router = useRouter();
    const { examId, exam, configuration, mediaPipeSandbox, isLoading } = useStudentExamData();
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
    } = useCheckupManager({ configuration });
    const {
        overlayCanvasRef,
        analysis: mediaPipeAnalysis,
        errorMessage: mediaPipeError,
        calibrationProgress,
        isCalibrated,
        isEnabled: isMediaPipeEnabled,
    } = useCheckupMediaPipe({
        videoRef,
        streamActive: isStreamActive,
        configuration,
        mediaPipeSandbox,
    });
    const isMediaPipeReady =
        !isMediaPipeEnabled || !mediaPipeSandbox.calibrationRequired || isCalibrated;
    const isCheckupReady = isDeviceCheckupReady && isMediaPipeReady;
    const faceVisibilityLabel =
        mediaPipeAnalysis?.status === 'no-face'
            ? 'Face not visible'
            : mediaPipeAnalysis?.status === 'multiple-faces'
              ? 'Multiple faces detected'
              : mediaPipeAnalysis?.faceCount
                ? 'Single face visible'
                : 'Awaiting frame analysis';
    const multipleFaceLabel =
        mediaPipeAnalysis?.status === 'multiple-faces'
            ? 'Additional person detected in frame'
            : 'No additional faces detected';
    const gazeGuidanceLabel =
        mediaPipeAnalysis?.eyeState === 'closed'
            ? 'Open your eyes and face the camera to continue calibration.'
            : mediaPipeAnalysis?.status === 'off-screen'
              ? 'Center your face and eyes inside the frame.'
              : mediaPipeAnalysis?.status === 'ready'
                ? 'Keep your face centered to complete calibration.'
                : mediaPipeAnalysis?.status === 'no-face'
                  ? 'Move into view so MediaPipe can confirm visibility.'
                  : 'MediaPipe will guide gaze calibration once frames stabilize.';
    const confidenceSnapshot =
        mediaPipeAnalysis?.confidenceScore !== null &&
        mediaPipeAnalysis?.confidenceScore !== undefined
            ? mediaPipeAnalysis.confidenceScore.toFixed(2)
            : 'n/a';
    const calibrationCompletionLabel = isCalibrated
        ? 'Calibration complete'
        : mediaPipeSandbox.calibrationRequired
          ? 'Calibration still required'
          : 'Calibration guidance in progress';

    useEffect(() => {
        patchStoredStudentExamFlow(examId, { checkupCompleted: isCheckupReady });
    }, [isCheckupReady, examId]);

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    const highlights = [
        {
            label: 'Camera',
            value: configuration.cameraRequired ? 'Required' : 'Optional',
        },
        {
            label: 'Microphone',
            value: configuration.micRequired ? 'Required' : 'Optional',
        },
        {
            label: 'Browser',
            value: 'Permission check',
        },
        ...(isMediaPipeEnabled
            ? [
                  {
                      label: 'MediaPipe',
                      value: mediaPipeSandbox.calibrationRequired
                          ? 'Calibration required'
                          : 'Calibration optional',
                  },
              ]
            : []),
    ] as const;

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
                ? 'Students will be asked to stay in fullscreen mode.'
                : 'Fullscreen is not required for this exam.',
            state: configuration.webSecurity.full_screen_required ? 'idle' : 'granted',
            icon: Monitor,
        },
        ...(isMediaPipeEnabled
            ? [
                  {
                      label: 'Face tracking',
                      description: mediaPipeSandbox.calibrationRequired
                          ? 'A stable single-face calibration is required before continuing.'
                          : 'MediaPipe readiness guidance is available during checkup.',
                      state:
                          mediaPipeError || mediaPipeAnalysis?.status === 'multiple-faces'
                              ? ('blocked' as const)
                              : isCalibrated || !mediaPipeSandbox.calibrationRequired
                                ? ('granted' as const)
                                : ('idle' as const),
                      icon: ScanFace,
                  },
              ]
            : []),
    ] as const;

    return (
        <StudentFlowShell>
            <div>
                <section className="space-y-3 border-b pb-5 sm:space-y-4 sm:pb-6">
                    <PreviewPageHeader
                        title="System Checkup"
                        description="Allow the required device permissions and confirm the setup before continuing to the lobby."
                    />

                    <div className="grid gap-x-6 gap-y-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                        {highlights.map((item) => (
                            <div key={item.label} className="space-y-1">
                                <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                                    {item.label}
                                </p>
                                <p className="text-sm leading-5 font-semibold">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid items-stretch gap-4 py-5 sm:gap-5 sm:py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:gap-8 xl:gap-10">
                    <div className="border-border/60 bg-background flex h-full flex-col rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <DevicePreviewPanel
                            videoRef={videoRef}
                            overlayCanvasRef={overlayCanvasRef}
                            streamActive={isStreamActive}
                            isRequesting={isRequesting}
                            errorMessage={errorMessage}
                            onRequestAccess={requestDeviceAccess}
                        />
                    </div>

                    <div className="border-border/60 bg-background flex h-full flex-col space-y-5 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:border-l lg:bg-transparent lg:p-0 lg:pl-6 xl:pl-8">
                        <CheckupStatusCard checks={checks} />

                        {isMediaPipeEnabled ? (
                            <div className="border-primary/10 bg-primary/5 rounded-2xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">MediaPipe readiness</p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            Face status {mediaPipeAnalysis?.status ?? 'idle'} • Gaze{' '}
                                            {mediaPipeAnalysis?.gazeDirection ?? 'not available'}
                                        </p>
                                    </div>
                                    <Badge variant={isMediaPipeReady ? 'default' : 'secondary'}>
                                        {isMediaPipeReady ? 'Ready' : 'Calibrating'}
                                    </Badge>
                                </div>
                                <Progress value={calibrationProgress} className="mt-4 h-2" />
                                <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                                    {mediaPipeSandbox.calibrationRequired
                                        ? 'Stable single-face frames are required before the lobby unlocks.'
                                        : 'MediaPipe is running as readiness guidance only during checkup.'}
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="border-primary/10 bg-background/80 rounded-xl border p-3">
                                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                                            Face visibility
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {faceVisibilityLabel}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {mediaPipeAnalysis?.faceCount ?? 0} face(s) in frame
                                        </p>
                                    </div>

                                    <div className="border-primary/10 bg-background/80 rounded-xl border p-3">
                                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                                            Multiple-face warning
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {multipleFaceLabel}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Status {mediaPipeAnalysis?.status ?? 'idle'}
                                        </p>
                                    </div>

                                    <div className="border-primary/10 bg-background/80 rounded-xl border p-3">
                                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                                            Gaze calibration guidance
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {mediaPipeAnalysis?.gazeDirection ?? 'not available'}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {gazeGuidanceLabel}
                                        </p>
                                    </div>

                                    <div className="border-primary/10 bg-background/80 rounded-xl border p-3">
                                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                                            Eye state
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {mediaPipeAnalysis?.eyeState ?? 'unknown'}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Helps confirm blink and closed-eye behavior during
                                            checkup.
                                        </p>
                                    </div>

                                    <div className="border-primary/10 bg-background/80 rounded-xl border p-3">
                                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                                            Confidence snapshot
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {confidenceSnapshot}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Threshold{' '}
                                            {mediaPipeSandbox.confidenceThreshold.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-primary/10 bg-background/80 mt-3 rounded-xl border p-3">
                                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                                        Calibration completion
                                    </p>
                                    <p className="mt-2 text-sm font-semibold">
                                        {calibrationCompletionLabel}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {mediaPipeSandbox.calibrationRequired
                                            ? 'The lobby unlocks once calibration reaches a stable ready state.'
                                            : 'This signal stays advisory until support marks calibration as required.'}
                                    </p>
                                </div>
                                {mediaPipeError ? (
                                    <p className="text-destructive mt-3 text-xs leading-relaxed">
                                        {mediaPipeError}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="border-t pt-4">
                            <ReadinessList items={CHECKUP_READINESS_ITEMS} />
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    primaryLabel="Continue to Lobby"
                    primaryDisabled={!isCheckupReady}
                    primaryOnClick={() => router.push(buildStudentExamHref(examId, 'lobby'))}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildStudentExamHref(examId, 'privacy')}
                />
            </div>
        </StudentFlowShell>
    );
}
