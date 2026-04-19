'use client';

import Link from 'next/link';
import { Button } from '@sentinel/ui';
import { ArrowLeft } from 'lucide-react';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { buildStudentExamHref } from '../_lib/student-exam-flow';
import { PreviewPageHeader } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-page-header';
import { PreviewHighlightsList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/cards/preview-highlights-list';
import { ReadinessList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/lists/readiness-list';
import { PreviewFooterActions } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-footer-actions';
import {
    COMMON_HIGHLIGHT_ICONS,
    INSTRUCTION_READINESS_ITEMS,
} from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants';

export default function StudentExamInstructionPage() {
    const { examId, exam, configuration, questions, isLoading } = useStudentExamData();
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
    });

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
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
        <StudentFlowShell>
            <div>
                <section className="space-y-4 border-b pb-6 sm:space-y-5 sm:pb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-muted-foreground -ml-2 h-8 w-fit gap-2 px-2"
                    >
                        <Link href="/student/exam">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Back to Exams</span>
                        </Link>
                    </Button>

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

                <section className="grid items-stretch gap-4 py-6 sm:gap-5 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:gap-8 xl:gap-10">
                    <div className="border-border/60 bg-background flex h-full flex-col space-y-4 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <h2 className="text-base font-semibold sm:text-lg">Instructions</h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-6 sm:text-[15px]">
                            <p>
                                {exam?.description?.trim()
                                    ? exam.description
                                    : 'This flow guides you through orientation, privacy, and device readiness before the exam begins.'}
                            </p>
                            <p>
                                Before entering the next step, confirm that your browser
                                permissions, device setup, and testing space are ready for a secure
                                session.
                            </p>
                        </div>
                    </div>

                    <div className="border-border/60 bg-background flex h-full flex-col space-y-4 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <h2 className="text-base font-semibold sm:text-lg">Before you continue</h2>
                        <ReadinessList items={INSTRUCTION_READINESS_ITEMS} />

                        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                            <p className="text-blue-800/80 dark:text-blue-200/80">
                                <span className="font-semibold">Note:</span> Review each step
                                carefully before continuing into the live exam session.
                            </p>
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    title="Ready to proceed?"
                    description="Continue to the privacy step to review the consent screen."
                    primaryLabel="Continue to Privacy"
                    primaryHref={buildStudentExamHref(examId, 'privacy')}
                />
            </div>
        </StudentFlowShell>
    );
}
