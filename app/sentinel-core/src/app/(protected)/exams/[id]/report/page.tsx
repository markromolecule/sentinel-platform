'use client';

import { use, useState } from 'react';
import { useApi, useExamReportQuery } from '@sentinel/hooks';
import type { ExamReportActionItem } from '@sentinel/shared/types';
import { Button, Card, CardContent } from '@sentinel/ui';
import { ArrowLeft, ClipboardList, FileText, RotateCcw, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ActionListCard } from './_components/action-list-card';
import { AttemptSummaryTable } from './_components/attempt-summary-table';
import { ExamWindowCard } from './_components/exam-window-card';
import { IncidentBreakdown } from './_components/incident-breakdown';
import { SummaryCard } from './_components/summary-card';
import { formatDateTime, formatPercent, grantLifecycleOverride } from './_helpers/report-helpers';

export default function ExamReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const apiClient = useApi();
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const { data: report, isLoading, isError, refetch, isFetching } = useExamReportQuery(id);

    const handleGrantOverride = async (
        item: ExamReportActionItem,
        overrideType: 'MAKEUP' | 'RETAKE',
    ) => {
        const minutesInput = window.prompt(
            `Grant a ${overrideType === 'MAKEUP' ? 'makeup' : 'retake'} window for how many minutes?`,
            '120',
        );

        if (!minutesInput) {
            return;
        }

        const minutes = Number(minutesInput);

        if (!Number.isFinite(minutes) || minutes <= 0) {
            toast.error('Enter a valid availability window in minutes.');
            return;
        }

        const notes = window.prompt(
            `Add a note for this ${overrideType === 'MAKEUP' ? 'makeup' : 'retake'} grant.`,
            overrideType === 'MAKEUP' ? 'Approved makeup window.' : 'Approved retake window.',
        );

        setActiveActionId(item.studentId);

        try {
            await grantLifecycleOverride({
                apiClient,
                examId: id,
                item,
                overrideType,
                availableFrom: new Date().toISOString(),
                availableUntil: new Date(Date.now() + minutes * 60_000).toISOString(),
                notes: notes?.trim() ? notes.trim() : null,
            });

            toast.success(
                overrideType === 'MAKEUP'
                    ? 'Makeup window granted successfully.'
                    : 'Retake window granted successfully.',
            );
            await refetch();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to grant override.');
        } finally {
            setActiveActionId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-1 flex-col space-y-6 p-8">
                <div className="space-y-2">
                    <div className="bg-muted h-8 w-64 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-80 animate-pulse rounded" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-muted h-36 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className="flex h-full flex-1 flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Exam Report</h1>
                        <p className="text-muted-foreground">
                            The exam report could not be loaded for this exam.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/exams">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Exams
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-sm">
                            Try refreshing the report. If the issue persists, the exam may not be
                            available in your current scope.
                        </p>
                        <Button className="mt-4" onClick={() => refetch()}>
                            Retry Report
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-1 flex-col space-y-8 p-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">
                        <Link href="/exams" className="hover:text-foreground transition-colors">
                            Exams
                        </Link>{' '}
                        / <span>{report.exam.title}</span> / <span>Report</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FileText className="text-muted-foreground h-7 w-7" />
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                {report.exam.title}
                            </h1>
                            <p className="text-muted-foreground">
                                {report.exam.subject} • Scheduled{' '}
                                {formatDateTime(report.exam.scheduledDate)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                        {isFetching ? 'Refreshing...' : 'Refresh Report'}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/exams">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Exams
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Assigned Students"
                    value={report.summary.totalAssignedStudents.toString()}
                    hint={`${report.summary.totalAbsent} absent • ${report.summary.totalStarted} started`}
                />
                <SummaryCard
                    title="Submitted"
                    value={report.summary.totalSubmitted.toString()}
                    hint={`${report.summary.flaggedStudentsCount} flagged for review`}
                />
                <SummaryCard
                    title="Average Score"
                    value={formatPercent(report.summary.averageScore)}
                    hint={`Pass rate ${formatPercent(report.summary.passRate)}`}
                />
                <SummaryCard
                    title="Action Queue"
                    value={(
                        report.summary.needsReviewCount +
                        report.summary.needsMakeupCount +
                        report.summary.needsRetakeCount
                    ).toString()}
                    hint={`${report.summary.needsReviewCount} review • ${report.summary.needsMakeupCount} makeup • ${report.summary.needsRetakeCount} retake`}
                />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <ActionListCard
                    title="Needs Review"
                    icon={<ShieldAlert className="h-5 w-5 text-red-500" />}
                    items={report.actionItems.review}
                    emptyMessage="No students currently need incident review."
                />
                <ActionListCard
                    title="Needs Makeup"
                    icon={<ClipboardList className="h-5 w-5 text-amber-500" />}
                    items={report.actionItems.makeup}
                    emptyMessage="No absent students need a makeup workflow."
                    actionLabel="Grant Makeup"
                    onAction={(item) => {
                        void handleGrantOverride(item, 'MAKEUP');
                    }}
                    activeActionId={activeActionId}
                />
                <ActionListCard
                    title="Needs Retake"
                    icon={<RotateCcw className="h-5 w-5 text-blue-500" />}
                    items={report.actionItems.retake}
                    emptyMessage="No students currently need a retake recommendation."
                    actionLabel="Grant Retake"
                    onAction={(item) => {
                        void handleGrantOverride(item, 'RETAKE');
                    }}
                    activeActionId={activeActionId}
                />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
                <IncidentBreakdown summary={report.summary} />
                <ExamWindowCard exam={report.exam} />
            </div>

            <AttemptSummaryTable students={report.students} />
        </div>
    );
}
