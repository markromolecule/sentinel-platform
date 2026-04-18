'use client';

import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Card, CardContent } from '@sentinel/ui';
import { Clock, User } from 'lucide-react';
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
        <Card className="group bg-card border-border/50 hover:border-primary/50 flex h-full flex-col overflow-hidden transition-all duration-300">
            {/* Card Cover / Top Decoration */}
            <div className="from-primary/20 to-primary/10 relative flex h-32 flex-col justify-between bg-gradient-to-br p-4">
                <div className="absolute top-4 right-4">
                    <Badge
                        className={cn(
                            'capitalize shadow-sm',
                            exam.status === 'available'
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : exam.status === 'upcoming'
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
                        )}
                    >
                        {exam.status}
                    </Badge>
                </div>

                <div className="mt-auto space-y-1">
                    <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-xl font-bold transition-colors">
                        {exam.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-1 text-sm font-medium">
                        {exam.subject}
                    </p>
                </div>
            </div>

            <CardContent className="flex flex-1 flex-col justify-between gap-4 px-5 pt-4 pb-5">
                <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center text-sm">
                        <Clock className="text-primary/70 mr-2 h-4 w-4" />
                        {exam.duration} minutes
                    </div>
                    <div className="text-muted-foreground flex items-center text-sm">
                        <User className="text-primary/70 mr-2 h-4 w-4" />
                        {exam.section || exam.room || 'Assigned exam'}
                    </div>
                </div>

                {exam.status === 'upcoming' ? (
                    <Button className="mt-auto w-full" variant="outline" disabled>
                        Coming Soon
                    </Button>
                ) : (
                    <Link href={`/student/exam/${exam.id}/instruction`} className="mt-auto w-full">
                        <Button className="w-full" variant="outline">
                            {actionLabel}
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
