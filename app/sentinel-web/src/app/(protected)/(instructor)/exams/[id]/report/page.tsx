'use client';

import { type ReactNode, use, useMemo, useState } from 'react';
import { useApi, useExamReportQuery } from '@sentinel/hooks';
import { createStudentExamAccessOverride } from '@sentinel/services';
import type { ExamReport, ExamReportActionItem } from '@sentinel/shared/types';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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

function SummaryCard({ title, value, hint }: { title: string; value: string; hint: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{value}</div>
                <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
            </CardContent>
        </Card>
    );
}

function ActionListCard({
    title,
    icon,
    items,
    emptyMessage,
    actionLabel,
    onAction,
    activeActionId,
}: {
    title: string;
    icon: ReactNode;
    items: ExamReportActionItem[];
    emptyMessage: string;
    actionLabel?: string;
    onAction?: (item: ExamReportActionItem) => void;
    activeActionId?: string | null;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{emptyMessage}</p>
                ) : (
                    items.slice(0, 5).map((item) => (
                        <div
                            key={`${item.id}-${item.reason}`}
                            className="border-border/70 space-y-3 rounded-lg border p-3"
                        >
                            <div>
                                <div className="font-medium">
                                    {item.lastName}, {item.firstName}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {item.studentNo} • {item.reason}
                                </div>
                            </div>
                            {actionLabel && onAction ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onAction(item)}
                                    disabled={activeActionId === item.studentId}
                                >
                                    {activeActionId === item.studentId
                                        ? 'Applying...'
                                        : actionLabel}
                                </Button>
                            ) : null}
                        </div>
                    ))
                )}
                {items.length > 5 ? (
                    <p className="text-muted-foreground text-xs">
                        Showing 5 of {items.length} students.
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}

export default function ExamReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const apiClient = useApi();
    const [searchValue, setSearchValue] = useState('');
    const [sectionFilter, setSectionFilter] = useState('all');
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

    const sectionOptions = useMemo(
        () =>
            Array.from(
                new Map(
                    (report?.students ?? [])
                        .map((student) =>
                            student.sectionId && student.sectionName
                                ? ([student.sectionId, student.sectionName] as const)
                                : null,
                        )
                        .filter((entry): entry is readonly [string, string] => Boolean(entry)),
                ).entries(),
            ).sort((left, right) => left[1].localeCompare(right[1])),
        [report?.students],
    );

    const visibleStudents = useMemo(() => {
        const students = report?.students ?? [];
        const normalizedSearch = searchValue.trim().toLowerCase();

        return students.filter((student) => {
            if (sectionFilter !== 'all' && student.sectionId !== sectionFilter) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            return [student.firstName, student.lastName, student.studentNo, student.sectionName]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(normalizedSearch);
        });
    }, [report?.students, searchValue, sectionFilter]);

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
                <Card>
                    <CardHeader>
                        <CardTitle>Incident Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <h3 className="text-muted-foreground text-sm font-medium">By Type</h3>
                            {report.summary.incidentBreakdownByType.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No incidents were recorded for this exam.
                                </p>
                            ) : (
                                report.summary.incidentBreakdownByType.map((item) => (
                                    <div
                                        key={item.type}
                                        className="border-border/70 flex items-center justify-between rounded-lg border px-3 py-2"
                                    >
                                        <span className="text-sm font-medium">
                                            {item.type.replaceAll('_', ' ')}
                                        </span>
                                        <Badge variant="secondary">{item.count}</Badge>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-muted-foreground text-sm font-medium">
                                By Severity
                            </h3>
                            {report.summary.incidentBreakdownBySeverity.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No severity data is available for this exam.
                                </p>
                            ) : (
                                report.summary.incidentBreakdownBySeverity.map((item) => (
                                    <div
                                        key={item.severity}
                                        className="border-border/70 flex items-center justify-between rounded-lg border px-3 py-2"
                                    >
                                        <span className="text-sm font-medium capitalize">
                                            {item.severity}
                                        </span>
                                        <Badge variant="secondary">{item.count}</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Exam Window</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                            <span>Start</span>
                            <span className="text-foreground text-right">
                                {formatDateTime(report.exam.scheduledDate)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>End</span>
                            <span className="text-foreground text-right">
                                {formatDateTime(report.exam.endDateTime)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Duration</span>
                            <span className="text-foreground text-right">
                                {report.exam.durationMinutes} minutes
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Passing Score</span>
                            <span className="text-foreground text-right">
                                {report.exam.passingScore}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Attempt Summary Report</CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Absentees stay in the list so the instructor can act on makeup and
                            retake decisions from the same report.
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
                </CardHeader>
                <CardContent>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No students matched the current search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    visibleStudents.map((student) => (
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
                                                    variant={getStatusBadgeVariant(student.status)}
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
                                                    {getSubmissionTypeLabel(student.submissionType)}
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
                                                    Reviewed {student.incidentOutcomes.reviewed} •
                                                    Confirmed {student.incidentOutcomes.confirmed} •
                                                    Dismissed {student.incidentOutcomes.dismissed}
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-56">
                                                <div className="text-sm">
                                                    Started: {formatDateTime(student.startedAt)}
                                                </div>
                                                <div className="text-muted-foreground text-sm">
                                                    Completed: {formatDateTime(student.completedAt)}
                                                </div>
                                                <div className="text-muted-foreground text-sm">
                                                    Time spent:{' '}
                                                    {student.timeSpentMinutes !== null
                                                        ? `${student.timeSpentMinutes} min`
                                                        : 'N/A'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
