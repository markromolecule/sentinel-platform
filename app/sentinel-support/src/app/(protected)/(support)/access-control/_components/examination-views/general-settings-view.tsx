'use client';

import { Input } from '@sentinel/ui';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

type GeneralSettingsViewProps = {
    draft: ExaminationGlobalSettings;
    isPending: boolean;
    updateField: <K extends keyof ExaminationGlobalSettings>(key: K, value: ExaminationGlobalSettings[K]) => void;
};

export function GeneralSettingsView({ draft, isPending, updateField }: GeneralSettingsViewProps) {
    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                    General Baseline
                </h2>
                <p className="text-muted-foreground mt-1 text-xs font-medium">
                    Core configurations for timing, scoring, and continuity.
                </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-6">
                    <label className="block space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                            Default Duration
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={1}
                                value={draft.defaultDurationMinutes}
                                onChange={(e) => updateField('defaultDurationMinutes', Number(e.target.value) || 0)}
                                disabled={isPending}
                                className="h-11 rounded-xl bg-muted/20 pr-12 font-bold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[10px] font-bold text-muted-foreground/60 uppercase">
                                Min
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/70 italic">
                            Initial time allocated for new exam instances.
                        </p>
                    </label>

                    <label className="block space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                            Passing Score
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={draft.defaultPassingScore}
                                onChange={(e) => updateField('defaultPassingScore', Number(e.target.value) || 0)}
                                disabled={isPending}
                                className="h-11 rounded-xl bg-muted/20 pr-12 font-bold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[10px] font-bold text-muted-foreground/60 uppercase">
                                Percent
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/70 italic">
                            The minimum threshold required for success.
                        </p>
                    </label>
                </div>

                <div className="space-y-6">
                    <label className="block space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                            Max Reconnects
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                value={draft.defaultMaxReconnectAttempts}
                                onChange={(e) => updateField('defaultMaxReconnectAttempts', Number(e.target.value) || 0)}
                                disabled={isPending}
                                className="h-11 rounded-xl bg-muted/20 pr-12 font-bold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[10px] font-bold text-muted-foreground/60 uppercase">
                                Tries
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/70 italic">
                            Allowance for network instability before termination.
                        </p>
                    </label>

                    <label className="block space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                            Auto-Submit Timeout
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                value={draft.defaultAutoSubmitTimeoutMinutes}
                                onChange={(e) => updateField('defaultAutoSubmitTimeoutMinutes', Number(e.target.value) || 0)}
                                disabled={isPending}
                                className="h-11 rounded-xl bg-muted/20 pr-12 font-bold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[10px] font-bold text-muted-foreground/60 uppercase">
                                Min
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/70 italic">
                            Window before orphaned attempts are finalized.
                        </p>
                    </label>
                </div>
            </div>
        </div>
    );
}
