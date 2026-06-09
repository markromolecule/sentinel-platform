'use client';

import * as React from 'react';
import { type ExamCompletionMetric } from '@sentinel/services';
import {
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Progress,
    Separator,
} from '@sentinel/ui';
import { ChartProps } from '@sentinel/shared/types';
import { mapExamStats } from '../_utils/map-exam-stats';

/**
 * ExamCompletionChart shows a period-based completion snapshot so users can
 * understand the result without needing to interpret a time axis.
 *
 * @param props - Component properties containing chart data array
 */
export function ExamCompletionChart({ data }: ChartProps) {
    const examStats = React.useMemo(
        () => mapExamStats(data as unknown as ExamCompletionMetric[]),
        [data],
    );
    const droppedShare = 100 - examStats.completionRate;

    return (
        <Card className="border-border/60 bg-card/70 h-full shadow-sm backdrop-blur-md">
            <CardHeader className="space-y-2 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">
                            Exam Completion Snapshot
                        </CardTitle>
                        <CardDescription>
                            Completion performance for the current analytics scope.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">
                        Current scope
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="rounded-xl border bg-muted/20 p-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                                    Completion rate
                                </p>
                                <p className="mt-2 text-4xl leading-none font-semibold tracking-tight">
                                    {examStats.completionRate}%
                                </p>
                            </div>
                            <div className="pb-1 text-right">
                                <p className="text-sm font-medium">of all sessions</p>
                                <p className="text-muted-foreground text-xs">
                                    {examStats.totalSessions.toLocaleString()} total monitored
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <Progress value={examStats.completionRate} className="h-3" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Completed</span>
                                <span>Dropped</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <div className="rounded-xl border bg-background p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                                    Completed
                                </p>
                                <p className="text-2xl font-semibold tracking-tight">
                                    {examStats.totalCompleted.toLocaleString()}
                                </p>
                            </div>
                            <Progress value={examStats.completionRate} className="mt-3 h-2" />
                        </div>

                        <div className="rounded-xl border bg-background p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                                    Dropped
                                </p>
                                <p className="text-2xl font-semibold tracking-tight">
                                    {examStats.totalDropped.toLocaleString()}
                                </p>
                            </div>
                            <Progress value={droppedShare} className="mt-3 h-2" />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border bg-muted/20 p-4">
                        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                            Total monitored
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                            {examStats.totalSessions.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            All included sessions in this scope
                        </p>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4">
                        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                            Success share
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                            {examStats.completionRate}%
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Completed out of total sessions
                        </p>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4">
                        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                            Drop share
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                            {droppedShare}%
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Aborted or interrupted sessions
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
