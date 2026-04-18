'use client';

import { Button, cn } from '@sentinel/ui';
import { CalendarClock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ExamHistory } from '@sentinel/shared/types';
import type { DateGroup } from '@/app/(protected)/student/_lib/student-exam-listing';
import { formatDateTimeLabel } from '@/app/(protected)/student/_lib/student-exam-listing';

type HistoryDateGroupsProps = {
    groups: DateGroup<ExamHistory>[];
    emptyMessage: string;
};

function getHistoryAction(item: ExamHistory) {
    if (item.status === 'upcoming') {
        return {
            href: `/student/exam/${item.examId}/instruction`,
            label: 'Open Exam',
        };
    }

    if (item.attemptId) {
        return {
            href: `/student/history/details?attemptId=${item.attemptId}`,
            label: 'Details',
        };
    }

    return {
        href: `/student/history/details?examId=${item.examId}`,
        label: 'Details',
    };
}

function getPrimaryLine(item: ExamHistory) {
    if (item.status === 'turned_in') {
        return `Turned In ${formatDateTimeLabel(item.completedAt)}`;
    }

    if (item.status === 'past_due') {
        return `Due ${formatDateTimeLabel(item.dueAt)}`;
    }

    return `Available ${formatDateTimeLabel(item.availableAt ?? item.dueAt)}`;
}

export function HistoryDateGroups({ groups, emptyMessage }: HistoryDateGroupsProps) {
    if (groups.length === 0) {
        return (
            <div className="bg-muted/50 border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <CalendarClock className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">No exams found</h3>
                <p className="text-muted-foreground mx-auto max-w-md">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {groups.map((group) => (
                <section key={group.key} className="space-y-3">
                    <div className="flex items-baseline gap-3 border-b border-border/60 pb-3">
                        <h2 className="text-foreground text-2xl font-semibold">{group.heading}</h2>
                        <p className="text-muted-foreground text-lg">{group.subheading}</p>
                    </div>

                    <div className="space-y-3">
                        {group.items.map((item) => {
                            const action = getHistoryAction(item);

                            return (
                                <div
                                    key={item.id}
                                    className="bg-card border-border/60 flex flex-col gap-4 rounded-2xl border p-5 shadow-sm transition-colors hover:border-primary/40 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-foreground text-xl font-semibold">
                                                {item.examTitle}
                                            </h3>
                                            <span
                                                className={cn(
                                                    'rounded-full px-3 py-1 text-xs font-semibold uppercase',
                                                    item.status === 'turned_in'
                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                        : item.status === 'past_due'
                                                          ? 'bg-destructive/10 text-destructive'
                                                          : 'bg-primary/10 text-primary',
                                                )}
                                            >
                                                {item.status.replace('_', ' ')}
                                            </span>
                                            {item.result && (
                                                <span
                                                    className={cn(
                                                        'rounded-full px-3 py-1 text-xs font-semibold uppercase',
                                                        item.result === 'passed'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-amber-500/10 text-amber-700',
                                                    )}
                                                >
                                                    {item.result}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground text-sm">
                                            {item.subject}
                                            {item.sectionName ? ` • ${item.sectionName}` : ''}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {getPrimaryLine(item)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 md:justify-end">
                                        <div className="text-muted-foreground text-right text-sm">
                                            <div>
                                                {typeof item.score === 'number' &&
                                                typeof item.totalScore === 'number'
                                                    ? `${item.score}/${item.totalScore}`
                                                    : 'No submission'}
                                            </div>
                                            <div>
                                                {typeof item.percentage === 'number'
                                                    ? `${item.percentage}%`
                                                    : item.status === 'past_due'
                                                      ? 'Missed due date'
                                                      : 'Pending'}
                                            </div>
                                        </div>
                                        <Button asChild variant="outline" className="min-w-32">
                                            <Link href={action.href}>
                                                {action.label}
                                                <ChevronRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
