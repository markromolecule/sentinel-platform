'use client';

import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Card, CardContent } from '@sentinel/ui';
import { Clock, User, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@sentinel/ui';
import { StudentExamCardProps as ExamCardProps } from '@sentinel/shared/types';

export function ExamCard({ exam }: ExamCardProps) {
    const actionLabel =
        exam.status === 'in-progress'
            ? 'Resume Exam'
            : exam.status === 'completed'
                ? 'Review Flow'
                : 'Open Exam';

    return (
        <Card className="hover:border-primary/50 group flex flex-col overflow-hidden rounded-none transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-5">
                {/* Top Section */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-none transition-colors group-hover:bg-primary group-hover:text-white">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="line-clamp-1 text-base font-bold transition-colors group-hover:text-primary leading-tight">
                                {exam.title}
                            </h3>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-tight truncate">
                                {exam.subject}
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={cn(
                            'rounded-none border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-none shrink-0',
                            exam.status === 'available'
                                ? 'bg-primary text-primary-foreground'
                                : exam.status === 'upcoming'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-muted text-muted-foreground',
                        )}
                    >
                        {exam.status}
                    </Badge>
                </div>

                {/* Bottom Section: Metadata and Action */}
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{exam.duration}m</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[100px]">
                                {exam.section || exam.room || 'Exam'}
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {exam.status === 'upcoming' ? (
                            <Button className="h-8 px-4 text-xs font-bold uppercase rounded-none" variant="outline" disabled>
                                Upcoming
                            </Button>
                        ) : (
                            <Link href={`/student/exam/${exam.id}/instruction`}>
                                <Button className="h-8 px-4 text-xs font-bold uppercase rounded-none" variant="outline">
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
