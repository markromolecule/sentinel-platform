'use client';

import { use, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useApi, useExamReportQuery } from '@sentinel/hooks';
import { createStudentExamAccessOverride } from '@sentinel/services';
import type { ExamReport, ExamReportActionItem } from '@sentinel/shared/types';
import {
    Badge,
    Button,
    Input,
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@sentinel/ui';
import {
    AlertTriangle,
    ArrowLeft,
    ClipboardList,
    FileText,
    RotateCcw,
    Search,
    ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ExamsPagination } from '@/features/exams/_components/views/exams-pagination';

type ActionTabKey = 'review' | 'makeup' | 'retake';

function formatDateTime(value?: string | Date | null) {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not available';
    }

    return date.toLocaleString();
}

function formatPercent(value?: number | null) {
    if (typeof value !== 'number') {
        return 'N/A';
    }

    return `${value.toFixed(1)}%`;
}

function getStatusBadgeVariant(status: ExamReport['students'][number]['status']) {
    switch (status) {
        case 'flagged':
            return 'destructive';
        case 'submitted':
            return 'default';
        case 'absent':
            return 'secondary';
        default:
            return 'outline';
    }
}

function getStatusLabel(status: ExamReport['students'][number]['status']) {
    switch (status) {
        case 'flagged':
            return 'Needs review';
        case 'submitted':
            return 'Submitted';
        case 'absent':
            return 'Absent';
        default:
            return 'In progress';
    }
}

function getSubmissionTypeLabel(submissionType: ExamReport['students'][number]['submissionType']) {
    switch (submissionType) {
        case 'manual_submit':
            return 'Manual submit';
        case 'auto_submit':
            return 'Auto-submit';
        case 'force_close':
            return 'Force close';
        case 'absent':
            return 'Absent';
        case 'retake':
            return 'Retake';
        default:
            return 'Pending end state';
    }
}

function getAttemptKindLabel(attemptKind: ExamReport['students'][number]['attemptKind']) {
    switch (attemptKind) {
        case 'makeup':
            return 'Makeup attempt';
        case 'retake':
            return 'Retake attempt';
        case 'primary':
            return 'Primary attempt';
        default:
            return 'No completed attempt';
    }
}

function paginateItems<T>(items: T[], page: number, pageSize: number) {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
        items: items.slice(start, start + pageSize),
        pagination: {
            page: safePage,
            pageSize,
            total,
            totalPages,
            hasMore: safePage < totalPages,
        },
    };
}

function SummaryMetric({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <div className="space-y-1.5 border-l pl-4 first:border-l-0 first:pl-0">
            <div className="text-muted-foreground text-sm font-medium">{label}</div>
            <div className="text-3xl font-semibold tracking-tight">{value}</div>
            <div className="text-muted-foreground text-sm">{hint}</div>
        </div>
    );
}

function DetailList({
    title,
    items,
    emptyMessage,
    renderValue,
}: {
    title: string;
    items: Array<{ key: string; label: string; count: number }>;
    emptyMessage: string;
    renderValue?: (count: number) => React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold">{title}</h3>
            {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">{emptyMessage}</p>
            ) : (
                <div className="divide-y rounded-xl border">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                            <span className="text-sm font-medium">{item.label}</span>
                            <span className="text-muted-foreground text-sm">
                                {renderValue ? renderValue(item.count) : item.count}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ActionQueuePanel({
    title,
    description,
    icon,
    items,
    actionLabel,
    onAction,
    activeActionId,
    page,
    onPageChange,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    items: ExamReportActionItem[];
    actionLabel?: string;
    onAction?: (item: ExamReportActionItem) => void;
    activeActionId?: string | null;
    page: number;
    onPageChange: (page: number) => void;
}) {
    const paginated = paginateItems(items, page, 8);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <Badge variant="secondary">{items.length}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-sm">
                    No students in this queue right now.
                </div>
            ) : (
                <>
                    <div className="divide-y rounded-xl border">
                        {paginated.items.map((item) => (
                            <div
                                key={`${item.id}-${item.reason}`}
                                className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="font-medium">
                                        {item.lastName}, {item.firstName}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {item.studentNo}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {item.reason}
                                    </div>
                                </div>
                                {actionLabel && onAction ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full md:w-auto"
                                        onClick={() => onAction(item)}
                                        disabled={activeActionId === item.studentId}
                                    >
                                        {activeActionId === item.studentId
                                            ? 'Applying...'
                                            : actionLabel}
                                    </Button>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <ExamsPagination
                        page={paginated.pagination.page}
                        pageCount={paginated.pagination.totalPages}
                        pageSize={paginated.pagination.pageSize}
                        totalCount={paginated.pagination.total}
                        onPageChange={onPageChange}
                    />
                </>
            )}
        </div>
    );
}

export default function ExamReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const apiClient = useApi();
    const [searchValue, setSearchValue] = useState('');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [studentPage, setStudentPage] = useState(1);
    const [actionTab, setActionTab] = useState<ActionTabKey>('review');
    const [actionPages, setActionPages] = useState<Record<ActionTabKey, number>>({
        review: 1,
        makeup: 1,
        retake: 1,
    });
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const deferredSearchValue = useDeferredValue(searchValue);
    const pageSize = 10;
    const reportQuery = useMemo(
        () => ({
            search: deferredSearchValue.trim() || undefined,
            sectionId: sectionFilter !== 'all' ? sectionFilter : undefined,
            page: studentPage,
            pageSize,
        }),
        [deferredSearchValue, sectionFilter, studentPage],
    );
    const { data: report, isLoading, isError, refetch, isFetching } = useExamReportQuery(
        id,
        reportQuery,
    );

    useEffect(() => {
        setStudentPage(1);
    }, [deferredSearchValue, sectionFilter]);

    const sectionOptions = useMemo(
        () => (report?.sections ?? []).map((section) => [section.id, section.name] as const),
        [report?.sections],
    );

    const actionQueues = useMemo(
        () =>
            report
                ? {
                      review: report.actionItems.review,
                      makeup: report.actionItems.makeup,
                      retake: report.actionItems.retake,
                  }
                : {
                      review: [],
                      makeup: [],
                      retake: [],
                  },
        [report],
    );

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
            await createStudentExamAccessOverride(apiClient, {
                id,
                studentId: item.studentId,
                overrideType,
                availableFrom: new Date().toISOString(),
                availableUntil: new Date(Date.now() + minutes * 60_000).toISOString(),
                allowedAttempts: 1,
                sourceAttemptId: overrideType === 'RETAKE' ? item.attemptId : null,
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
            <div className="flex h-full flex-1 flex-col space-y-6 p-6 md:p-8">
                <div className="space-y-2">
                    <div className="bg-muted h-8 w-64 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-80 animate-pulse rounded" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-muted h-28 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className="flex h-full flex-1 flex-col space-y-6 p-6 md:p-8">
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
                <div className="rounded-xl border border-dashed px-4 py-6">
                    <p className="text-muted-foreground text-sm">
                        Try refreshing the report. If the issue persists, the exam may not be
                        available in your current scope.
                    </p>
                    <Button className="mt-4" onClick={() => refetch()}>
                        Retry Report
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-1 flex-col space-y-6 p-4 md:p-6 lg:p-8">
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

            <section className="grid gap-4 border-y py-5 md:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric
                    label="Assigned Students"
                    value={report.summary.totalAssignedStudents.toString()}
                    hint={`${report.summary.totalAbsent} absent • ${report.summary.totalStarted} started`}
                />
                <SummaryMetric
                    label="Submitted"
                    value={report.summary.totalSubmitted.toString()}
                    hint={`${report.summary.flaggedStudentsCount} flagged for review`}
                />
                <SummaryMetric
                    label="Average Score"
                    value={formatPercent(report.summary.averageScore)}
                    hint={`Pass rate ${formatPercent(report.summary.passRate)}`}
                />
                <SummaryMetric
                    label="Action Queue"
                    value={(
                        report.summary.needsReviewCount +
                        report.summary.needsMakeupCount +
                        report.summary.needsRetakeCount
                    ).toString()}
                    hint={`${report.summary.needsReviewCount} review • ${report.summary.needsMakeupCount} makeup • ${report.summary.needsRetakeCount} retake`}
                />
            </section>

            <Tabs defaultValue="attempts" className="space-y-5">
                <TabsList variant="line" className="h-auto w-full justify-start gap-2 overflow-x-auto border-b rounded-none p-0 pb-2">
                    <TabsTrigger value="attempts" className="min-w-fit px-3">
                        Attempt Summary
                    </TabsTrigger>
                    <TabsTrigger value="queue" className="min-w-fit px-3">
                        Action Queue
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="min-w-fit px-3">
                        Overview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="attempts" className="m-0 space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">Attempt Summary Report</h2>
                            <p className="text-muted-foreground text-sm">
                                Absentees stay in the list so instructors can manage makeup and
                                retake workflows in one place.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                            <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                <SelectTrigger className="w-full md:w-56">
                                    <SelectValue placeholder="Filter by section" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All sections</SelectItem>
                                    {sectionOptions.map(([sectionId, sectionName]) => (
                                        <SelectItem key={sectionId} value={sectionId}>
                                            {sectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="relative w-full md:w-72">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    placeholder="Search student"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border">
                        <ScrollArea className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Student</TableHead>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Incidents</TableHead>
                                        <TableHead>Submission</TableHead>
                                        <TableHead>Review Outcomes</TableHead>
                                        <TableHead>Timeline</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center">
                                                No students matched the current filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        report.students.map((student) => (
                                            <TableRow
                                                key={`${student.id}-${student.attemptId ?? 'none'}`}
                                            >
                                                <TableCell className="min-w-56">
                                                    <div className="font-medium">
                                                        {student.lastName}, {student.firstName}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {student.studentNo}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {student.needsReview ? (
                                                            <Badge variant="destructive">
                                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                                Review
                                                            </Badge>
                                                        ) : null}
                                                        {student.needsMakeup ? (
                                                            <Badge variant="secondary">Makeup</Badge>
                                                        ) : null}
                                                        {student.needsRetake ? (
                                                            <Badge variant="outline">Retake</Badge>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {student.sectionName ?? 'Unassigned'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusBadgeVariant(
                                                            student.status,
                                                        )}
                                                    >
                                                        {getStatusLabel(student.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {student.score ?? 'N/A'} /{' '}
                                                        {student.totalScore ?? 'N/A'}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {formatPercent(student.percentage)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {student.incidentCount} total
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {student.openIncidentCount} open
                                                    </div>
                                                    {student.primaryIncidentType ? (
                                                        <div className="text-muted-foreground mt-2 text-xs">
                                                            Primary:{' '}
                                                            {student.primaryIncidentType.replaceAll(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {getSubmissionTypeLabel(
                                                            student.submissionType,
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {student.attemptCount} attempt
                                                        {student.attemptCount === 1 ? '' : 's'}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {getAttemptKindLabel(student.attemptKind)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        Pending {student.incidentOutcomes.pending}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        Reviewed {student.incidentOutcomes.reviewed}{' '}
                                                        • Confirmed{' '}
                                                        {student.incidentOutcomes.confirmed} •
                                                        Dismissed{' '}
                                                        {student.incidentOutcomes.dismissed}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="min-w-56">
                                                    <div className="text-sm">
                                                        Started:{' '}
                                                        {formatDateTime(student.startedAt)}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        Completed:{' '}
                                                        {formatDateTime(student.completedAt)}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        Time spent:{' '}
                                                        {student.timeSpentMinutes !== null
                                                            ? `${student.timeSpentMinutes} min`
                                                            : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {student.attemptId ? (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link
                                                                href={`/exams/reports/${id}/${student.attemptId}`}
                                                            >
                                                                View Attempt
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">
                                                            No attempt
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>

                    <ExamsPagination
                        page={report.studentsPagination.page}
                        pageCount={Math.max(report.studentsPagination.totalPages, 1)}
                        pageSize={report.studentsPagination.pageSize}
                        totalCount={report.studentsPagination.total}
                        onPageChange={setStudentPage}
                    />
                </TabsContent>

                <TabsContent value="queue" className="m-0 space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Action Queue</h2>
                        <p className="text-muted-foreground text-sm">
                            Review, makeup, and retake queues stay on one page and paginate cleanly
                            for large classes.
                        </p>
                    </div>

                    <Tabs
                        value={actionTab}
                        onValueChange={(value) => setActionTab(value as ActionTabKey)}
                        className="space-y-4"
                    >
                        <TabsList variant="line" className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none border-b p-0 pb-2">
                            <TabsTrigger value="review" className="min-w-fit px-3">
                                Needs Review ({actionQueues.review.length})
                            </TabsTrigger>
                            <TabsTrigger value="makeup" className="min-w-fit px-3">
                                Needs Makeup ({actionQueues.makeup.length})
                            </TabsTrigger>
                            <TabsTrigger value="retake" className="min-w-fit px-3">
                                Needs Retake ({actionQueues.retake.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="review" className="m-0">
                            <ActionQueuePanel
                                title="Needs Review"
                                description="Use this queue for students with unresolved or high-severity incidents."
                                icon={<ShieldAlert className="h-5 w-5 text-red-500" />}
                                items={actionQueues.review}
                                page={actionPages.review}
                                onPageChange={(page) =>
                                    setActionPages((current) => ({ ...current, review: page }))
                                }
                                activeActionId={activeActionId}
                            />
                        </TabsContent>

                        <TabsContent value="makeup" className="m-0">
                            <ActionQueuePanel
                                title="Needs Makeup"
                                description="Absent students remain here until a makeup window is granted."
                                icon={<ClipboardList className="h-5 w-5 text-amber-500" />}
                                items={actionQueues.makeup}
                                actionLabel="Grant Makeup"
                                onAction={(item) => {
                                    void handleGrantOverride(item, 'MAKEUP');
                                }}
                                page={actionPages.makeup}
                                onPageChange={(page) =>
                                    setActionPages((current) => ({ ...current, makeup: page }))
                                }
                                activeActionId={activeActionId}
                            />
                        </TabsContent>

                        <TabsContent value="retake" className="m-0">
                            <ActionQueuePanel
                                title="Needs Retake"
                                description="Students below the passing score stay here until the instructor grants a retake."
                                icon={<RotateCcw className="h-5 w-5 text-blue-500" />}
                                items={actionQueues.retake}
                                actionLabel="Grant Retake"
                                onAction={(item) => {
                                    void handleGrantOverride(item, 'RETAKE');
                                }}
                                page={actionPages.retake}
                                onPageChange={(page) =>
                                    setActionPages((current) => ({ ...current, retake: page }))
                                }
                                activeActionId={activeActionId}
                            />
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="overview" className="m-0 space-y-6">
                    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                        <DetailList
                            title="Incident Breakdown"
                            emptyMessage="No incidents were recorded for this exam."
                            items={report.summary.incidentBreakdownByType.map((item) => ({
                                key: item.type,
                                label: item.type.replaceAll('_', ' '),
                                count: item.count,
                            }))}
                        />

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold">Exam Window</h3>
                            <div className="divide-y rounded-xl border">
                                <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                                    <span className="text-muted-foreground">Start</span>
                                    <span className="text-right">
                                        {formatDateTime(report.exam.scheduledDate)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                                    <span className="text-muted-foreground">End</span>
                                    <span className="text-right">
                                        {formatDateTime(report.exam.endDateTime)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="text-right">
                                        {report.exam.durationMinutes} minutes
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                                    <span className="text-muted-foreground">Passing Score</span>
                                    <span className="text-right">
                                        {report.exam.passingScore}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DetailList
                        title="Severity Breakdown"
                        emptyMessage="No severity data is available for this exam."
                        items={report.summary.incidentBreakdownBySeverity.map((item) => ({
                            key: item.severity,
                            label: item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
                            count: item.count,
                        }))}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
