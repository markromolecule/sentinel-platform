'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox, Label } from '@sentinel/ui';
import { Eye, Mic, Monitor } from 'lucide-react';
import { PreviewHeader } from '../common/preview-header';
import { PreviewLoadingState } from '../preview-loading-state';
import { usePreviewExamData } from '../../_hooks/use-preview-exam-data';
import { buildPreviewHref } from '../preview-page-shell';
import { PreviewHighlightsList } from '../cards/preview-highlights-list';
import { DisclosureList } from '../lists/disclosure-list';
import { PreviewPageHeader } from '../common/preview-page-header';
import { PreviewFooterActions } from '../common/preview-footer-actions';
import { PrivacyPolicySections } from '../sections/privacy-policy-sections';
import { PRIVACY_STATIC_HIGHLIGHTS } from '../../_constants/preview-constants';

export function PrivacyView() {
    const router = useRouter();
    const { examId, sessionId, configuration, isLoading } = usePreviewExamData();
    const [hasConsented, setHasConsented] = useState(false);

    if (isLoading) {
        return <PreviewLoadingState />;
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
        <div className="selection:bg-primary/10 min-h-screen bg-white font-sans">
            <PreviewHeader examId={examId} badgeLabel="Privacy Consent" />

            <main className="mx-auto max-w-4xl px-5 pb-8 sm:px-8 sm:pb-10">
                <section className="space-y-5 border-b pb-8">
                    <PreviewPageHeader
                        title="Privacy & Data Consent"
                        description="Review how exam data is collected, protected, and used before moving to the device checkup step."
                    />

                    <PreviewHighlightsList highlights={PRIVACY_STATIC_HIGHLIGHTS} columns={3} />
                </section>

                <section className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.8fr)]">
                    <div className="space-y-6">
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
                                <span className="font-semibold">Note:</span> This preview simulates
                                the privacy consent experience only. No actual identity data or
                                telemetry is stored during this run.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <PrivacyPolicySections />

                        <div className="border-t pt-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="privacy-consent"
                                    checked={hasConsented}
                                    onCheckedChange={(checked) => setHasConsented(checked === true)}
                                    className="mt-1"
                                />
                                <Label
                                    htmlFor="privacy-consent"
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
                    primaryOnClick={() =>
                        router.push(buildPreviewHref(examId, sessionId, 'checkup'))
                    }
                    secondaryLabel="Previous Step"
                    secondaryHref={buildPreviewHref(examId, sessionId, 'instruction')}
                />
            </main>
        </div>
    );
}
