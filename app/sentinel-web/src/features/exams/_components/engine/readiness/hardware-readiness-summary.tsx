'use client';

import { Shield } from 'lucide-react';
import { Badge, cn } from '@sentinel/ui';

import type { HardwareReadinessSummaryProps } from '../types';
import { isPreviewMode } from '../utils';

export function HardwareReadinessSummary({
    items,
    activeRules,
    platform,
    mode = 'runtime',
}: HardwareReadinessSummaryProps) {
    return (
        <div className="flex h-full flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8">
            <article className="border-border/60 bg-background overflow-hidden rounded-3xl border">
                <div className="border-border/60 flex items-center justify-between border-b px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold">Readiness summary</h2>
                        <p className="text-muted-foreground text-sm">
                            Shared status primitives for preview and runtime.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] tracking-[0.16em] uppercase">
                        {platform === 'mobile' ? 'Mobile' : 'Desktop'}
                    </Badge>
                </div>
                <div className="divide-border/60 divide-y">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        'mt-0.5 rounded-2xl p-2',
                                        item.status === 'success' &&
                                            'bg-emerald-500/10 text-emerald-600',
                                        item.status === 'pending' &&
                                            'bg-amber-500/10 text-amber-600',
                                        item.status === 'optional' &&
                                            'bg-slate-500/10 text-slate-600',
                                    )}
                                >
                                    {item.icon}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-muted-foreground text-sm leading-6">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'shrink-0 text-[10px] tracking-[0.16em] uppercase',
                                    item.status === 'success' &&
                                        'border-emerald-200 bg-emerald-50 text-emerald-700',
                                    item.status === 'pending' &&
                                        'border-amber-200 bg-amber-50 text-amber-700',
                                    item.status === 'optional' &&
                                        'border-slate-200 bg-slate-50 text-slate-700',
                                )}
                            >
                                {item.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </article>

            <article className="border-border/60 bg-muted/30 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                <div className="mb-4 flex items-center gap-2">
                    <Shield className="text-primary h-4 w-4" />
                    <h2 className="text-lg font-semibold">Active monitoring cues</h2>
                </div>
                {activeRules.length ? (
                    <div className="flex flex-wrap gap-2">
                        {activeRules.map((rule) => (
                            <Badge key={rule} variant="secondary" className="rounded-full px-3 py-1">
                                {rule}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm leading-6">
                        Monitoring cues are muted in this preview state.
                    </p>
                )}
            </article>

            {isPreviewMode(mode) ? (
                <p className="text-muted-foreground text-sm leading-6">
                    Preview can simulate readiness outcomes without touching real permissions,
                    telemetry, or LiveKit state.
                </p>
            ) : null}
        </div>
    );
}
