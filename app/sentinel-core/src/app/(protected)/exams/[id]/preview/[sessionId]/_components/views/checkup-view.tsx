'use client';

import { useRouter } from 'next/navigation';
import { Camera, Mic, Monitor } from 'lucide-react';
import { PreviewHeader } from '../common/preview-header';
import { PreviewLoadingState } from '../preview-loading-state';
import { usePreviewExamData } from '../../_hooks/use-preview-exam-data';
import { buildPreviewHref } from '../preview-page-shell';
import { PreviewFooterActions } from '../common/preview-footer-actions';
import { ReadinessList } from '../lists/readiness-list';
import { CHECKUP_READINESS_ITEMS } from '../../_constants/preview-constants';
import { useCheckupManager } from '../../_hooks/use-checkup-manager';
import { DevicePreviewPanel } from '../checkup/device-preview-panel';
import { CheckupStatusCard } from '../checkup/checkup-status-card';

export function CheckupView() {
    const router = useRouter();
    const { examId, sessionId, exam, configuration, isLoading } = usePreviewExamData();
    const {
        videoRef,
        cameraState,
        micState,
        isRequesting,
        isStreamActive,
        errorMessage,
        isCheckupReady,
        requestDeviceAccess,
    } = useCheckupManager({ configuration });

    if (isLoading) {
        return <PreviewLoadingState />;
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
            label: 'Exam',
            value: exam?.title ?? 'Preview session',
        },
        {
            label: 'Browser',
            value: 'Permission check',
        },
    ] as const;

    const checks = [
        {
            label: 'Camera',
            description: configuration.cameraRequired
                ? 'Required for face visibility during the exam.'
                : 'Not required for this preview.',
            state: configuration.cameraRequired ? cameraState : 'granted',
            icon: Camera,
        },
        {
            label: 'Microphone',
            description: configuration.micRequired
                ? 'Required for room audio monitoring.'
                : 'Not required for this preview.',
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
    ] as const;

    return (
        <div className="selection:bg-primary/10 min-h-screen bg-white font-sans">
            <PreviewHeader examId={examId} badgeLabel="System Checkup" />

            <main className="mx-auto w-full max-w-4xl px-5 pb-8 sm:px-8 sm:pb-10 lg:max-w-6xl lg:px-10 xl:px-12">
                <section className="space-y-5 border-b pb-8">
                    <div className="space-y-3">
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-[30px] lg:text-[34px]">
                            System Checkup
                        </h1>
                        <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-[15px]">
                            Allow the required device permissions and confirm the setup before
                            continuing to the lobby.
                        </p>
                    </div>

                    <div className="grid gap-x-8 gap-y-4 pt-2 sm:grid-cols-3 xl:grid-cols-4">
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

                <section className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] lg:gap-14 xl:gap-16">
                    <DevicePreviewPanel
                        videoRef={videoRef}
                        streamActive={isStreamActive}
                        isRequesting={isRequesting}
                        errorMessage={errorMessage}
                        onRequestAccess={requestDeviceAccess}
                    />

                    <div className="space-y-6 lg:border-l lg:pl-8 xl:pl-10">
                        <CheckupStatusCard checks={checks} />

                        <div className="border-t pt-4">
                            <ReadinessList items={CHECKUP_READINESS_ITEMS} />
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    primaryLabel="Continue to Lobby"
                    primaryDisabled={!isCheckupReady}
                    primaryOnClick={() => router.push(buildPreviewHref(examId, sessionId, 'lobby'))}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildPreviewHref(examId, sessionId, 'privacy')}
                />
            </main>
        </div>
    );
}
