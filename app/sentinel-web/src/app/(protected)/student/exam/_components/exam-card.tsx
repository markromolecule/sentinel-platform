'use client';

import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Card, CardContent } from '@sentinel/ui';
import { Clock, User, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@sentinel/ui';
import { StudentExamCardProps as ExamCardProps } from '@sentinel/shared/types';

export function ExamCard({ exam }: ExamCardProps) {
    const isCompleted = exam.status === 'completed' || exam.status === 'turned_in';
    const isInProgress = exam.status === 'in-progress';
    const isAvailable = exam.status === 'available';
    const isUpcoming = exam.status === 'upcoming' || exam.status === 'scheduled';
    const isPastDue = exam.status === 'past_due' || exam.status === 'archived';

    const actionLabel = isInProgress
        ? 'Resume Exam'
        : isCompleted
          ? 'Review Flow'
          : isUpcoming
            ? 'Upcoming'
            : exam.status === 'archived'
              ? 'Archived'
              : isPastDue
                ? 'Past Due'
                : 'Open Exam';

    const actionHref = isCompleted
        ? exam.attemptId
            ? `/student/history/details?attemptId=${exam.attemptId}`
            : `/student/history/details?examId=${exam.id}`
        : `/student/exam/${exam.id}/instruction`;

    const isActive = isCompleted || isInProgress || isAvailable;

    return (
        <Card className="hover:border-primary/50 group flex flex-col overflow-hidden rounded-none transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-5">
                {/* Top Section */}
                <div className="mb-5 flex items-start justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-primary/10 text-primary group-hover:bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-none transition-colors group-hover:text-white">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="group-hover:text-primary line-clamp-1 text-base leading-tight font-bold transition-colors">
                                {exam.title}
                            </h3>
                            <p className="text-muted-foreground truncate text-xs font-medium tracking-tight uppercase">
                                {exam.subject}
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={cn(
                            'shrink-0 rounded-none border-none px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-none',
                            exam.status === 'available'
                                ? 'bg-primary text-primary-foreground'
                                : exam.status === 'upcoming' || exam.status === 'scheduled'
                                  ? 'bg-amber-500 text-white'
                                  : exam.status === 'in-progress'
                                    ? 'bg-secondary text-secondary-foreground'
                                    : exam.status === 'turned_in'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-muted text-muted-foreground',
                        )}
                    >
                        {exam.status === 'turned_in'
                            ? 'turned in'
                            : exam.status === 'past_due'
                              ? 'past due'
                              : exam.status}
                    </Badge>
                </div>

                {/* Bottom Section: Metadata and Action */}
                <div className="border-border/50 flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-5">
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{exam.duration}m</span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                            <User className="h-3.5 w-3.5" />
                            <span className="max-w-[100px] truncate">
                                {exam.section || exam.room || 'Exam'}
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {!isActive ? (
                            <Button
                                className="h-8 rounded-none px-4 text-xs font-bold uppercase"
                                variant="outline"
                                disabled
                            >
                                {actionLabel}
                            </Button>
                        ) : (
                            <Link href={actionHref}>
                                <Button
                                    className="h-8 rounded-none px-4 text-xs font-bold uppercase"
                                    variant={
                                        isInProgress
                                            ? 'secondary'
                                            : isCompleted
                                              ? 'outline'
                                              : 'default'
                                    }
                                >
                                    {actionLabel}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
