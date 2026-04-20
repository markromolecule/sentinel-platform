'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mic, Monitor } from 'lucide-react';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
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
    const { examId, exam, configuration, isLoading } = useStudentExamData();
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
        isCheckupReady,
        requestDeviceAccess,
    } = useCheckupManager({ configuration });

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
                            streamActive={isStreamActive}
                            isRequesting={isRequesting}
                            errorMessage={errorMessage}
                            onRequestAccess={requestDeviceAccess}
                        />
                    </div>

                    <div className="border-border/60 bg-background flex h-full flex-col space-y-5 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:border-l lg:bg-transparent lg:p-0 lg:pl-6 xl:pl-8">
                        <CheckupStatusCard checks={checks} />

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
