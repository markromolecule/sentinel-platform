'use client';

import Link from 'next/link';
import { Button } from '@sentinel/ui';
import { ArrowLeft } from 'lucide-react';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { StudentFlowShell } from '../_components/student-flow-shell';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import { buildStudentExamHref } from '../_lib/student-exam-flow';
import {
    StudentFlowFooterActions,
    StudentFlowHighlightsList,
    StudentFlowPageHeader,
    StudentFlowPanel,
    StudentFlowReadinessList,
} from '../../_components/student-flow-primitives';
import {
    COMMON_HIGHLIGHT_ICONS,
    INSTRUCTION_READINESS_ITEMS,
} from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants';

export default function StudentExamInstructionPage() {
    const { examId, exam, blockedState, configuration, questions, isLoading } =
        useStudentExamData();
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
        runtimeAccess: exam?.runtimeAccess,
    });

    if (isLoading || isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    if (blockedState.isBlocked) {
        return (
            <StudentFlowShell
                maxWidthClassName="max-w-5xl"
                mainClassName="py-6 sm:py-8"
                contentClassName="my-auto"
            >
                <div className="flex min-h-full flex-col justify-center gap-6">
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
    const readyNow = [
        'Power source connected',
        'Stable internet connection',
        'Quiet, cleared workspace',
    ];

    return (
        <StudentFlowShell
            maxWidthClassName="max-w-5xl"
            mainClassName="py-6 sm:py-8"
            contentClassName="my-auto"
        >
            <div className="flex min-h-full flex-col justify-center gap-6">
                <section className="space-y-4 border-b pb-5 sm:space-y-5 sm:pb-6">
                    <div className="flex items-center justify-between gap-4">
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

                        <span className="text-primary text-[11px] font-semibold tracking-[0.22em] uppercase">
                            Step 1 of 4
                        </span>
                    </div>

                    <StudentFlowPageHeader
                        title={exam?.title ?? 'Exam Orientation'}
                        description={exam?.subject ?? 'General Assessment'}
                    />

                    <StudentFlowHighlightsList highlights={highlights} />
                </section>

                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                    <StudentFlowPanel className="space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-base font-semibold sm:text-lg">Ready now</h2>
                            <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                                Finish these quick checks before you move on.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {readyNow.map((item) => (
                                <div
                                    key={item}
                                    className="border-border/60 bg-background rounded-2xl border px-4 py-3"
                                >
                                    <p className="text-sm font-medium">{item}</p>
                                </div>
                            ))}
                        </div>

                        <StudentFlowReadinessList items={INSTRUCTION_READINESS_ITEMS} />

                        <div className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                            <p className="text-blue-800/80 dark:text-blue-200/80">
                                <span className="font-semibold">Note:</span> The live exam does not
                                start here. You still have the Privacy, Checkup, and Lobby steps
                                ahead.
                            </p>
                        </div>
                    </StudentFlowPanel>

                    <StudentFlowPanel className="space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-base font-semibold sm:text-lg">Exam overview</h2>
                            <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                                {exam?.description?.trim()
                                    ? exam.description
                                    : 'Review the assigned exam details before continuing to privacy and device setup.'}
                            </p>
                        </div>

                        <div className="border-border/60 bg-muted/30 rounded-2xl border p-4">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                                        Subject
                                    </p>
                                    <p className="text-sm font-medium">
                                        {exam?.subject ?? 'General Assessment'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                                        Question Set
                                    </p>
                                    <p className="text-sm font-medium">
                                        {questions.length} total items
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                                        Exam Mode
                                    </p>
                                    <p className="text-sm font-medium">
                                        {configuration.strictMode
                                            ? 'Strict monitoring'
                                            : 'Standard monitoring'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </StudentFlowPanel>
                </section>

                <StudentFlowFooterActions
                    title="Next up: privacy review"
                    description="Continue when you are comfortable with the exam setup and flow."
                    primaryLabel="Continue to Privacy"
                    primaryHref={buildStudentExamHref(examId, 'privacy')}
                />
            </div>
        </StudentFlowShell>
    );
}
