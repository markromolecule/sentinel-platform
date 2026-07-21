'use client';

import { useRouter } from 'next/navigation';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { MonitoringPreloader } from '../_components/monitoring-preloader';
import { buildStudentExamHref } from '../_lib/student-exam-flow';
import { useCheckupPage } from './_hooks/use-checkup-page';
import { CheckupCalibrationPanel } from './_components/checkup-calibration-panel';
import { CheckupBlockedState } from './_components/checkup-blocked-state';
import {
    StudentFlowCheckupStatusCard,
    StudentFlowDevicePreviewPanel,
    StudentFlowFooterActions,
    StudentFlowPageHeader,
    StudentFlowPanel,
} from '../../_components/student-flow-primitives';

export default function StudentExamCheckupPage() {
    const router = useRouter();
    const {
        examId,
        blockedState,
        configuration,
        isLoading,
        isRedirectingToHistory,
        videoRef,
        overlayCanvasRef,
        isRequesting,
        isStreamActive,
        errorMessage,
        mediaPipeAnalysis,
        calibrationProgress,
        calibrationHoldDurationLabel,
        isCalibrated,
        isMediaPipeConfigured,
        isCalibrationPending,
        isCheckupFlowReady,
        handleRequestDeviceAccess,
        checks,
        currentStatusLabel,
        currentStatusDescription,
    } = useCheckupPage();

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    if (blockedState.isBlocked) {
        return (
            <CheckupBlockedState
                title={blockedState.title}
                message={blockedState.message}
            />
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
                                    <CheckupCalibrationPanel
                                        isCalibrated={isCalibrated}
                                        calibrationProgress={calibrationProgress}
                                        calibrationHoldDurationLabel={calibrationHoldDurationLabel}
                                        mediaPipeAnalysis={mediaPipeAnalysis}
                                    />
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
