'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox, Label } from '@sentinel/ui';
import { Eye, Mic, Monitor } from 'lucide-react';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import {
    buildStudentExamHref,
    patchStoredStudentExamFlow,
    readStoredStudentExamFlow,
} from '../_lib/student-exam-flow';
import { PreviewPageHeader } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-page-header';
import { PreviewHighlightsList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/cards/preview-highlights-list';
import { DisclosureList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/lists/disclosure-list';
import { PreviewFooterActions } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-footer-actions';
import { PrivacyPolicySections } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/sections/privacy-policy-sections';
import { PRIVACY_STATIC_HIGHLIGHTS } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants';

export default function StudentExamPrivacyPage() {
    const router = useRouter();
    const { examId, exam, configuration, isLoading } = useStudentExamData();
    const [hasConsented, setHasConsented] = useState(
        () => readStoredStudentExamFlow(examId).privacyAccepted,
    );
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
    });

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    const disclosures = [
        {
            label: 'Gaze Monitoring',
            icon: Eye,
            desc:
                configuration.aiRules.gaze_tracking || configuration.aiRules.face_detection
                    ? 'Active gaze tracking and identity verification will be used during this session.'
                    : 'Limited facial analysis is active for basic presence detection only.',
        },
        {
            label: 'Audio Environment',
            icon: Mic,
            desc: configuration.micRequired
                ? 'Room audio is monitored for unauthorized communication or prohibited voices.'
                : 'Microphone access is not required by the current proctoring policy.',
        },
        {
            label: 'Platform Security',
            icon: Monitor,
            desc: configuration.webSecurity.full_screen_required
                ? 'Browser-level locks and tab-switching monitors are strictly enforced.'
                : 'Standard monitoring is active without browser lock enforcement.',
        },
    ];

    return (
        <StudentFlowShell>
            <div>
                <section className="space-y-4 border-b pb-6 sm:space-y-5 sm:pb-8">
                    <PreviewPageHeader
                        title="Privacy & Data Consent"
                        description="Review how exam data is collected, protected, and used before moving to the device checkup step."
                    />

                    <PreviewHighlightsList highlights={PRIVACY_STATIC_HIGHLIGHTS} columns={3} />
                </section>

                <section className="grid items-stretch gap-4 py-6 sm:gap-5 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:gap-8 xl:gap-10">
                    <div className="border-border/60 bg-background flex h-full flex-col space-y-6 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold sm:text-lg">Data collection</h2>
                            <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                                Sentinel may request access to device signals and behavioral checks
                                required by your institution’s proctoring policy for this exam.
                            </p>
                        </div>

                        <DisclosureList items={disclosures} />

                        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                            <p className="text-blue-800/80 dark:text-blue-200/80">
                                <span className="font-semibold">Note:</span> Your consent is
                                required before continuing to the device readiness step.
                            </p>
                        </div>
                    </div>

                    <div className="border-border/60 bg-background flex h-full flex-col space-y-6 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <PrivacyPolicySections />

                        <div className="border-t pt-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="student-privacy-consent"
                                    checked={hasConsented}
                                    onCheckedChange={(checked) => {
                                        const accepted = checked === true;
                                        setHasConsented(accepted);
                                        patchStoredStudentExamFlow(examId, {
                                            privacyAccepted: accepted,
                                        });
                                    }}
                                    className="mt-1"
                                />
                                <Label
                                    htmlFor="student-privacy-consent"
                                    className="text-muted-foreground cursor-pointer text-sm leading-6 font-normal sm:text-[15px]"
                                >
                                    I understand that this exam may request device permissions and
                                    monitor behavior according to the rules set by the institution.
                                </Label>
                            </div>
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    primaryLabel="Continue to Checkup"
                    primaryDisabled={!hasConsented}
                    primaryOnClick={() => router.push(buildStudentExamHref(examId, 'checkup'))}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildStudentExamHref(examId, 'instruction')}
                />
            </div>
        </StudentFlowShell>
    );
}
