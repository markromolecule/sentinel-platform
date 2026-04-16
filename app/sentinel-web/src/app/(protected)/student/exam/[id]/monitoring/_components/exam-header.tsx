'use client';

import { Timer } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { Progress } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { MonitoringExamHeaderProps as ExamHeaderProps } from '@sentinel/shared/types';

export function ExamHeader({
    exam,
    timeLeft,
    isLowTime,
    progress,
    formatTime,
    onSubmit,
}: ExamHeaderProps) {
    return (
        <header className="bg-background/95 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur">
            <div className="container flex h-14 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-12">
                <div className="flex flex-col justify-center">
                    <h1 className="text-foreground mb-1 text-base leading-none font-bold">
                        {exam.title}
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-tight uppercase">
                        {exam.subject} • {exam.duration} Min • Score to Pass: {exam.passingScore}%
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div
                        className={cn(
                            'flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-bold shadow-sm transition-colors',
                            isLowTime
                                ? 'animate-pulse border-red-200 bg-red-50 text-red-600'
                                : 'bg-muted/50 text-foreground border-border',
                        )}
                    >
                        <Timer className="h-4 w-4" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onSubmit}
                        className="hidden h-8 px-4 text-xs font-bold shadow-md sm:inline-flex sm:px-6"
                    >
                        Submit Exam
                    </Button>
                </div>
            </div>
            <Progress value={progress} className="bg-muted h-1 rounded-none" />
        </header>
    );
}
