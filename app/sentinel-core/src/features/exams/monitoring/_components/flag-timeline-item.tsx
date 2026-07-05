'use client';

import { cn } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Clock, Eye } from 'lucide-react';
import type { Flag } from '@sentinel/shared/types';
import { flagIcons } from '@sentinel/shared/constants';
import {
    AUDIO_ANOMALY_BADGE_STYLES,
    formatAudioAnomalyLabel,
    formatWindow,
    formatTrigger,
    formatSeverityReason,
    getTimelineTitle,
    getTimelineDescription,
    getNormalizationNote,
    buildReviewNote,
} from './flag-timeline-helpers';

interface FlagTimelineItemProps {
    flag: Flag;
}

/**
 * FlagTimelineItem renders a single proctoring flag incident, severity badge, trigger code, and optional capture frame snapshot.
 */
export function FlagTimelineItem({ flag }: FlagTimelineItemProps) {
    const title = getTimelineTitle(flag);
    const description = getTimelineDescription(flag);
    const normalizationNote = getNormalizationNote(flag);
    const reviewNote = buildReviewNote(flag);
    const severityReasonLabel = formatSeverityReason(flag.severityReason);
    const triggerLabel = formatTrigger(flag.persistenceTrigger);
    const windowLabel = formatWindow(flag.matchingWindowSeconds);
    const anomalyLabel = formatAudioAnomalyLabel(flag.anomalyType);
    const confidenceLabel =
        typeof flag.confidenceScore === 'number'
            ? `${Math.round(flag.confidenceScore * 100)}% confidence`
            : null;

    return (
        <div className="group relative flex items-start gap-6">
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
                        {title}
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
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

                    {normalizationNote ? (
                        <p className="text-foreground/80 mt-2 text-xs leading-relaxed font-medium">
                            {normalizationNote}
                        </p>
                    ) : null}

                    {flag.rawEventType ? (
                        <div className="mt-3">
                            <span className="border-border/70 bg-background text-foreground/80 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
                                Trigger {flag.rawEventType}
                            </span>
                        </div>
                    ) : null}

                    {reviewNote ? (
                        <p className="text-foreground/80 mt-2 text-xs leading-relaxed font-medium">
                            {reviewNote}
                        </p>
                    ) : null}

                    {anomalyLabel ||
                    confidenceLabel ||
                    severityReasonLabel ||
                    triggerLabel ||
                    windowLabel ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {anomalyLabel ? (
                                <span
                                    className={cn(
                                        'rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase',
                                        flag.anomalyType
                                            ? AUDIO_ANOMALY_BADGE_STYLES[flag.anomalyType]
                                            : 'border-slate-200 bg-slate-100 text-slate-700',
                                    )}
                                >
                                    {anomalyLabel}
                                </span>
                            ) : null}
                            {confidenceLabel ? (
                                <span className="border-border/70 bg-background text-foreground/80 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
                                    {confidenceLabel}
                                </span>
                            ) : null}
                            {severityReasonLabel ? (
                                <span className="border-border/70 bg-background text-foreground/80 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
                                    {severityReasonLabel}
                                </span>
                            ) : null}
                            {triggerLabel ? (
                                <span className="border-border/70 bg-background text-muted-foreground rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
                                    {triggerLabel}
                                </span>
                            ) : null}
                            {windowLabel ? (
                                <span className="border-border/70 bg-background text-muted-foreground rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
                                    Window {windowLabel}
                                </span>
                            ) : null}
                        </div>
                    ) : null}

                    {flag.snapshotUrl && (
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="border-border/60 bg-muted/50 group-hover:border-border/80 relative aspect-video overflow-hidden rounded-lg border transition-colors">
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button variant="secondary" size="sm" className="h-8 shadow-lg">
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
    );
}
