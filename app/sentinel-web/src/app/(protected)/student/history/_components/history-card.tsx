import { Button } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import {
    AlertTriangle,
    AppWindow,
    Calendar,
    Camera,
    ChevronRight,
    Clock,
    Eye,
    Mic,
    Video,
} from 'lucide-react';
import Link from 'next/link';
import { HistoryCardProps } from '@sentinel/shared/types';
import { formatDateTimeLabel } from '@/app/(protected)/student/_lib/student-exam-listing';

function getHistoryHref(item: HistoryCardProps['item']) {
    if (item.status === 'upcoming') {
        return `/student/exam/${item.examId}/instruction`;
    }

    if (item.attemptId) {
        return `/student/history/details?attemptId=${item.attemptId}`;
    }

    return `/student/history/details?examId=${item.examId}`;
}

export function HistoryCard({ item }: HistoryCardProps) {
    return (
        <div className="group bg-card border-border/50 hover:border-primary/50 flex flex-col justify-between gap-4 rounded-xl border p-4 transition-all duration-200 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-4 md:w-auto">
                {/* Unified Score Box */}
                <div className="border-border bg-muted/50 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border">
                    <span className="text-foreground text-xl font-bold">{item.score ?? '--'}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">Score</span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <h3 className="text-foreground group-hover:text-primary truncate pr-2 text-lg leading-tight font-medium transition-colors">
                        {item.examTitle}
                    </h3>
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDateTimeLabel(item.completedAt ?? item.dueAt ?? item.availableAt)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {typeof item.timeSpent === 'number' ? `${item.timeSpent} min` : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cheating Flag & Status */}
            <div className="mt-2 flex w-full flex-col items-start justify-between gap-3 pl-[4.5rem] sm:flex-row sm:items-center sm:gap-6 md:mt-0 md:w-auto md:justify-end md:pl-0">
                {/* Cheating Indicator */}
                {item.cheated && (
                    <div className="bg-destructive/10 border-destructive/20 text-destructive flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-1.5 sm:w-auto sm:justify-start">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span className="flex items-center gap-1 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                            Flagged:
                            {item.cheatingType === 'gaze' && (
                                <>
                                    <Eye className="ml-1 h-3 w-3" /> Gaze
                                </>
                            )}
                            {item.cheatingType === 'audio' && (
                                <>
                                    <Mic className="ml-1 h-3 w-3" /> Audio
                                </>
                            )}
                            {item.cheatingType === 'tab_switch' && (
                                <>
                                    <AppWindow className="ml-1 h-3 w-3" /> Tab Switch
                                </>
                            )}
                            {item.cheatingType === 'screenshot' && (
                                <>
                                    <Camera className="ml-1 h-3 w-3" /> Screenshot
                                </>
                            )}
                            {item.cheatingType === 'screen_record' && (
                                <>
                                    <Video className="ml-1 h-3 w-3" /> Recording
                                </>
                            )}
                            {item.cheatingType === 'multiple' && 'Multiple'}
                        </span>
                    </div>
                )}

                {/* Status Text (Right Side) */}
                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                    <span
                        className={cn(
                            'text-sm font-bold tracking-wider uppercase',
                            item.status === 'turned_in'
                                ? 'text-green-500'
                                : item.status === 'past_due'
                                  ? 'text-destructive'
                                  : 'text-primary',
                        )}
                    >
                        {item.status.replace('_', ' ')}
                    </span>

                    <div className="bg-border mx-2 hidden h-8 w-px sm:block" />

                    <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground hover:bg-accent gap-2 transition-colors"
                    >
                        <Link href={getHistoryHref(item)}>
                            {item.status === 'upcoming' ? 'Open Exam' : 'Details'}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
