'use client';

import Link from 'next/link';
import { Button } from '@sentinel/ui';
import {
    ArrowRight,
    Calendar,
    AlertTriangle,
    Users2,
    ShieldAlert,
    Clock3,
    FileText,
} from 'lucide-react';

interface ExamActivityItem {
    exam_id: string;
    title: string;
    status: string;
    scheduled_date: string | null;
    duration_minutes: number;
    question_count: number | null;
    subject_title: string | null;
    subject_code: string | null;
    attempts_count: number;
    incidents_count: number;
}

interface ExamsActivityOverviewProps {
    exams: ExamActivityItem[];
}

/**
 * ExamsActivityOverview displays the instructor's exams list with attempt completion ratios,
 * integrity flags, and quick action redirects (Grade, Monitor, Edit) without heavy card outlines.
 *
 * @returns React component for exams overview
 */
export function ExamsActivityOverview({ exams }: ExamsActivityOverviewProps) {
    const displayedExams = exams.slice(0, 5);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Not scheduled';
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActivityHref = (exam: ExamActivityItem) => {
        if (exam.incidents_count > 0) {
            return `/exams/reports/${exam.exam_id}?section=logs`;
        }

        if (exam.attempts_count > 0) {
            return `/exams/reports/${exam.exam_id}?section=attempts`;
        }

        return `/exams/${exam.exam_id}/preview`;
    };

    const getActionLabel = (exam: ExamActivityItem) => {
        if (exam.incidents_count > 0) {
            return 'Review incidents';
        }

        if (exam.attempts_count > 0) {
            return 'View attempts';
        }

        return 'Open exam';
    };

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'active' || s === 'published') {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
        }
        if (s === 'draft') {
            return 'bg-amber-50 text-amber-700 border-amber-200/50';
        }
        return 'bg-muted text-muted-foreground border-border/30';
    };

    const getIncidentBadgeStyles = (count: number) => {
        if (count === 0) return 'text-muted-foreground bg-muted/50 border-border/20';
        if (count < 5) return 'text-amber-700 bg-amber-50 border-amber-200/60';
        return 'text-rose-700 bg-rose-50 border-rose-200/60';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    Exams Activity
                </h2>
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-fit text-[#323d8f] hover:bg-[#323d8f]/5"
                >
                    <Link href="/exams">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="divide-border/30 border-border/40 bg-background divide-y overflow-hidden border">
                {displayedExams.map((exam) => (
                    <div
                        key={exam.exam_id}
                        className="group hover:bg-muted/20 px-4 py-2.5 transition-colors sm:px-4"
                    >
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 space-y-1.5">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                    <div className="min-w-0">
                                        <Link
                                            href={getActivityHref(exam)}
                                            className="text-foreground line-clamp-1 text-sm font-semibold tracking-tight transition-colors group-hover:text-[#323d8f] sm:text-base"
                                        >
                                            {exam.title}
                                        </Link>
                                    </div>
                                    <span
                                        className={`w-fit border px-2 py-0.5 text-[10px] font-semibold tracking-tight ${getStatusStyles(
                                            exam.status,
                                        )}`}
                                    >
                                        {exam.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                                    {exam.subject_code || 'N/A'}
                                </p>

                                <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="text-muted-foreground/75 h-3.5 w-3.5" />
                                        {formatDate(exam.scheduled_date)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock3 className="text-muted-foreground/75 h-3.5 w-3.5" />
                                        {exam.duration_minutes} min
                                    </span>
                                    {exam.question_count !== null && (
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="text-muted-foreground/75 h-3.5 w-3.5" />
                                            {exam.question_count} q
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 lg:min-w-[260px] lg:justify-end">
                                <div className="border-border/30 bg-background text-muted-foreground flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium">
                                    <Users2 className="text-muted-foreground/70 h-3.5 w-3.5" />
                                    <span>{exam.attempts_count}</span>
                                </div>

                                <div
                                    className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${getIncidentBadgeStyles(
                                        exam.incidents_count,
                                    )}`}
                                >
                                    {exam.incidents_count > 0 ? (
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                    ) : (
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                    )}
                                    <span>{exam.incidents_count}</span>
                                </div>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-[#323d8f] hover:bg-[#323d8f]/5"
                                >
                                    <Link href={getActivityHref(exam)}>
                                        Open
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {displayedExams.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground text-sm font-medium">No exams found</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Create an exam to get started
                        </p>
                        <Button asChild className="mt-4 h-9 bg-[#323d8f] hover:bg-[#323d8f]/90">
                            <Link href="/exams">Create Exam</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
