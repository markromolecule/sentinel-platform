'use client';

import { PreviewLoadingState } from '../preview-loading-state';
import { PreviewHeader } from '../common/preview-header';
import { usePreviewExamData } from '../../_hooks/use-preview-exam-data';
import { buildPreviewHref } from '../preview-page-shell';
import { PreviewHighlightsList } from '../cards/preview-highlights-list';
import { ReadinessList } from '../lists/readiness-list';
import { PreviewPageHeader } from '../common/preview-page-header';
import { PreviewFooterActions } from '../common/preview-footer-actions';
import {
    COMMON_HIGHLIGHT_ICONS,
    INSTRUCTION_READINESS_ITEMS,
} from '../../_constants/preview-constants';

export function InstructionView() {
    const { examId, sessionId, exam, configuration, questions, isLoading } = usePreviewExamData();

    if (isLoading) {
        return <PreviewLoadingState />;
    }

    const highlights = [
        {
            label: 'Duration',
            value: `${exam?.duration ?? 0}m`,
            icon: COMMON_HIGHLIGHT_ICONS.Duration,
        },
        {
            label: 'Total Items',
            value: `${questions.length} Questions`,
            icon: COMMON_HIGHLIGHT_ICONS.Items,
        },
        {
            label: 'Platform',
            value: 'Sentinel Web',
            icon: COMMON_HIGHLIGHT_ICONS.Platform,
        },
        {
            label: 'Security',
            value: configuration.strictMode ? 'Strict' : 'Standard',
            icon: COMMON_HIGHLIGHT_ICONS.Security,
        },
    ];

    return (
        <div className="selection:bg-primary/10 min-h-screen bg-white font-sans">
            <PreviewHeader examId={examId} />

            <main className="mx-auto max-w-4xl px-5 pb-8 sm:px-8 sm:pb-10">
                <section className="space-y-5 border-b pb-8">
                    <PreviewPageHeader
                        title={exam?.title ?? 'Examination Orientation'}
                        description={`${exam?.subject ?? 'General Assessment'} • Orientation guide`}
                    />

                    <p className="text-foreground/80 max-w-2xl text-sm leading-6 sm:text-[15px]">
                        Review the exam details below and make sure the environment is ready before
                        continuing to the privacy step.
                    </p>

                    <PreviewHighlightsList highlights={highlights} />
                </section>

                <section className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.8fr)]">
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold sm:text-lg">Instructions</h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-6 sm:text-[15px]">
                            <p>
                                {exam?.description?.trim()
                                    ? exam.description
                                    : 'This preview mirrors the student orientation experience before the exam begins. Use it to quickly review content, layout, and readiness messaging.'}
                            </p>
                            <p>
                                Before entering the next step, confirm that your browser
                                permissions, device setup, and testing space are ready for a secure
                                session.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-base font-semibold sm:text-lg">Before you continue</h2>
                        <ReadinessList items={INSTRUCTION_READINESS_ITEMS} />

                        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                            <p className="text-blue-800/80 dark:text-blue-200/80">
                                <span className="font-semibold">Note:</span> This preview simulates
                                the student flow only. No actual attempt data will be recorded.
                            </p>
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    title="Ready to proceed?"
                    description="Continue to the privacy step to review the consent screen."
                    primaryLabel="Continue to Privacy"
                    primaryHref={buildPreviewHref(examId, sessionId, 'privacy')}
                />
            </main>
        </div>
    );
}
