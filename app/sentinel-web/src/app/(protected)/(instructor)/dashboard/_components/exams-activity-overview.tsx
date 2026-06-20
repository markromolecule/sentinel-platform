'use client';

import Link from 'next/link';
import { Button } from '@sentinel/ui';
import { ArrowRight, Calendar, AlertTriangle, Users2, ShieldAlert } from 'lucide-react';

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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    Exams Activity
                </h2>
                <Button asChild variant="ghost" size="sm" className="text-[#323d8f] hover:bg-[#323d8f]/5">
                    <Link href="/exams">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="divide-y divide-border/30 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
                {exams.map((exam) => (
                    <div
                        key={exam.exam_id}
                        className="group flex flex-col justify-between gap-4 p-4 transition-all duration-300 hover:bg-muted/30 sm:flex-row sm:items-center"
                    >
                        <div className="space-y-2">
                            {/* Exam details */}
                            <div>
                                <h3 className="text-foreground text-sm font-semibold tracking-tight">
                                    {exam.title}
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                    {exam.subject_title || 'No subject'} ({exam.subject_code || 'N/A'})
                                </p>
                            </div>

                            {/* Scheduling, duration info */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/75" />
                                    {formatDate(exam.scheduled_date)}
                                </span>
                                <span>•</span>
                                <span>{exam.duration_minutes} min</span>
                                {exam.question_count !== null && (
                                    <>
                                        <span>•</span>
                                        <span>{exam.question_count} questions</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Status, stats and quick action button */}
                        <div className="flex items-center flex-wrap gap-3 sm:justify-end">
                            {/* Status badge */}
                            <span
                                className={`rounded-full border px-2 py-0.5 text-xs font-semibold tracking-tight ${getStatusStyles(
                                    exam.status,
                                )}`}
                            >
                                {exam.status.toUpperCase()}
                            </span>

                            {/* Student Attempts Count */}
                            <div className="flex items-center gap-1.5 border border-border/20 bg-background rounded-full px-2.5 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
                                <Users2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                                <span>{exam.attempts_count} attempts</span>
                            </div>

                            {/* Flagged Incidents Count */}
                            <div
                                className={`flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${getIncidentBadgeStyles(
                                    exam.incidents_count,
                                )}`}
                            >
                                {exam.incidents_count > 0 ? (
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                ) : (
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                )}
                                <span>{exam.incidents_count} incidents</span>
                            </div>
                        </div>
                    </div>
                ))}

                {exams.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground text-sm font-medium">No exams found</p>
                        <p className="text-muted-foreground text-xs mt-1">Create an exam to get started</p>
                        <Button asChild className="mt-4 bg-[#323d8f] hover:bg-[#323d8f]/90 h-9">
                            <Link href="/exams">Create Exam</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
