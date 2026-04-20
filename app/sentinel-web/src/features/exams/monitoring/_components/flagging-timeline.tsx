'use client';

import { cn } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Eye, Clock, AlertCircle } from 'lucide-react';
import { Flag } from '@sentinel/shared/types';
import { flagIcons, flagLabels } from '@sentinel/shared/constants';

interface FlaggingTimelineProps {
    flags: Flag[];
}

export function FlaggingTimeline({ flags }: FlaggingTimelineProps) {
    if (flags.length === 0) {
        return (
            <div className="bg-muted/20 border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <AlertCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h4 className="text-foreground text-sm font-semibold">All Clear</h4>
                <p className="text-muted-foreground mt-1 max-w-[200px] text-xs">
                    No flagging events recorded for this session yet.
                </p>
            </div>
        );
    }

    return (
        <div className="before:via-border relative space-y-8 before:pointer-events-none before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#323d8f]/20 before:to-transparent">
            {flags
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((flag) => (
                    <div key={flag.id} className="group relative flex items-start gap-6">
                        {/* Timeline dot/icon */}
                        <div
                            className={cn(
                                'bg-background relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-transform group-hover:scale-110',
                                flag.severity === 'high'
                                    ? 'border-red-500 text-red-500'
                                    : flag.severity === 'medium'
                                        ? 'border-orange-500 text-orange-500'
                                        : 'border-blue-500 text-blue-500',
                            )}
                        >
                            {flagIcons[flag.type]}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 pt-1">
                            <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
                                    {flagLabels[flag.type]}
                                    {flag.occurrenceCount && flag.occurrenceCount > 1 && (
                                        <span className="bg-muted text-muted-foreground ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                            x{flag.occurrenceCount}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                                            flag.severity === 'high'
                                                ? 'bg-red-100 text-red-600'
                                                : flag.severity === 'medium'
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-blue-100 text-blue-600',
                                        )}
                                    >
                                        {flag.severity}
                                    </span>
                                </h4>
                                <div className="text-muted-foreground flex items-center text-xs font-medium">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {new Date(flag.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </div>
                            </div>

                            <div className="bg-muted/30 border-border/50 group-hover:border-border/80 rounded-xl border p-4 transition-colors">
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {flag.description}
                                </p>

                                {flag.snapshotUrl && (
                                    <div className="mt-4 flex flex-col gap-3">
                                        <div className="border-border/60 bg-muted/50 group-hover:border-border/80 relative aspect-video overflow-hidden rounded-lg border transition-colors">
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 shadow-lg"
                                                >
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    View Full Size
                                                </Button>
                                            </div>
                                            {/* In a real app, this would be the actual image */}
                                            <div className="flex h-full w-full items-center justify-center">
                                                <div className="text-muted-foreground font-mono text-[10px] uppercase opacity-40">
                                                    Snapshot: {flag.id.slice(0, 8)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 self-start px-3 text-xs text-[#323d8f] hover:bg-[#323d8f]/5 hover:text-[#323d8f]"
                                        >
                                            <Eye className="mr-2 h-3.5 w-3.5" />
                                            Analyze Frame
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
}
