'use client';

import { Button, cn } from '@sentinel/ui';
import { CalendarClock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Exam } from '@sentinel/shared/types';
import type { DateGroup } from '@/app/(protected)/student/_lib/student-exam-listing';
import { formatDateTimeLabel } from '@/app/(protected)/student/_lib/student-exam-listing';

type ExamDateGroupsProps = {
    groups: DateGroup<Exam>[];
    emptyMessage: string;
};

export function ExamDateGroups({ groups, emptyMessage }: ExamDateGroupsProps) {
    if (groups.length === 0) {
        return (
            <div className="bg-muted/50 border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <CalendarClock className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">No upcoming exams</h3>
                <p className="text-muted-foreground mx-auto max-w-md">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {groups.map((group) => (
                <section key={group.key} className="space-y-3">
                    <div className="border-border/60 flex items-baseline gap-3 border-b pb-3">
                        <h2 className="text-foreground text-2xl font-semibold">{group.heading}</h2>
                        <p className="text-muted-foreground text-lg">{group.subheading}</p>
                    </div>

                    <div className="space-y-3">
                        {group.items.map((exam) => (
                            <div
                                key={exam.id}
                                className="bg-card border-border/60 hover:border-primary/40 flex flex-col gap-4 rounded-2xl border p-5 shadow-sm transition-colors md:flex-row md:items-center md:justify-between"
                            >
                                <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-foreground text-xl font-semibold">
                                            {exam.title}
                                        </h3>
                                        <span
                                            className={cn(
                                                'rounded-full px-3 py-1 text-xs font-semibold uppercase',
                                                exam.status === 'upcoming'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-amber-500/10 text-amber-600',
                                            )}
                                        >
                                            {exam.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        {exam.subject}
                                        {exam.section ? ` • ${exam.section}` : ''}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Due{' '}
                                        {formatDateTimeLabel(
                                            exam.endDateTime ?? exam.scheduledDate,
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 md:justify-end">
                                    <div className="text-muted-foreground text-right text-sm">
                                        <div>{exam.duration} minutes</div>
                                        <div>{exam.questionCount ?? 0} questions</div>
                                    </div>
                                    <Button asChild variant="outline" className="min-w-32">
                                        <Link href={`/student/exam/${exam.id}/instruction`}>
                                            Open Exam
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
