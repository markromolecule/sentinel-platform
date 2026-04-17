'use client';

import { Clock3, Shield } from 'lucide-react';
import { cn } from '@sentinel/ui';

import type { ExamLobbyPanelProps } from '../types';
import { isPreviewMode } from '../utils';

export function ExamLobbyPanel({
    examTitle,
    canEnter,
    readyCount,
    totalChecks,
    reconnectLimit,
    mode = 'runtime',
}: ExamLobbyPanelProps) {
    return (
        <div className="flex h-full flex-col justify-between gap-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                <article className="border-border/60 bg-background rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Clock3 className="text-primary h-4 w-4" />
                        <h2 className="text-lg font-semibold">Ready to enter {examTitle}</h2>
                    </div>
                    <div className="text-muted-foreground space-y-4 text-sm leading-6">
                        <p>
                            This final readiness state is where the student confirms they understand
                            the environment checks and is about to transition into the live attempt.
                        </p>
                        <p>
                            Resume behavior should send an eligible student back into the active
                            session instead of creating a duplicate attempt.
                        </p>
                    </div>
                </article>

                <article className="border-border/60 bg-muted/30 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Shield className="text-primary h-4 w-4" />
                        <h2 className="text-lg font-semibold">Gate summary</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-white px-4 py-4">
                            <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                                Readiness
                            </p>
                            <p className="mt-2 text-2xl font-semibold">
                                {readyCount}/{totalChecks}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-4">
                            <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                                Reconnect policy
                            </p>
                            <p className="mt-2 text-sm font-medium leading-6">
                                Up to {reconnectLimit} reconnect attempt
                                {reconnectLimit === 1 ? '' : 's'} before the runtime needs to
                                escalate recovery handling.
                            </p>
                        </div>
                    </div>
                </article>
            </div>

            <div
                className={cn(
                    'rounded-3xl border px-5 py-4 text-sm leading-6 sm:px-6',
                    canEnter
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-amber-800',
                )}
            >
                {canEnter
                    ? 'All required preview checks are satisfied. Entering the attempt should remain a pure simulation here.'
                    : 'Some required preview checks are still pending. The live runtime should keep the learner in readiness until those checks pass.'}
                {isPreviewMode(mode) ? ' No session start happens from this route.' : null}
            </div>
        </div>
    );
}
