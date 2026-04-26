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
        <div className="space-y-10">
            <div className="space-y-1.5">
                <h3 className="text-[12px] font-semibold text-muted-foreground/80">
                    General Baseline
                </h3>
                <p className="text-foreground text-[14px] font-semibold">
                    Core configurations for timing, scoring, and continuity.
                </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-muted-foreground/80">
                            Default Duration
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={1}
                                value={draft.defaultDurationMinutes}
                                onChange={(e) => updateField('defaultDurationMinutes', Number(e.target.value) || 0)}
                                disabled={isPending}
                                className="h-10 rounded-none border-muted/60 bg-background pr-12 text-[14px] font-semibold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold text-muted-foreground/60">
                                Minutes
                            </div>
                        </div>
                        <p className="text-[12px] font-medium text-muted-foreground/70">
                            Initial time allocated for new exam instances.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-muted-foreground/80">
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
                                className="h-10 rounded-none border-muted/60 bg-background pr-12 text-[14px] font-semibold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold text-muted-foreground/60">
                                Percent
                            </div>
                        </div>
                        <p className="text-[12px] font-medium text-muted-foreground/70">
                            The minimum threshold required for success.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-muted-foreground/80">
                            Max Reconnect Attempts
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                value={draft.defaultMaxReconnectAttempts}
                                onChange={(e) => updateField('defaultMaxReconnectAttempts', Number(e.target.value) || 0)}
                                disabled={isPending}
                                className="h-10 rounded-none border-muted/60 bg-background pr-12 text-[14px] font-semibold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold text-muted-foreground/60">
                                Tries
                            </div>
                        </div>
                        <p className="text-[12px] font-medium text-muted-foreground/70">
                            Allowance for network instability before termination.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-muted-foreground/80">
                            Auto-Submit Timeout
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                value={draft.defaultAutoSubmitTimeoutMinutes}
                                onChange={(e) => updateField('defaultAutoSubmitTimeoutMinutes', Number(e.target.value) || 0)}
                                disabled={isPending}
                                className="h-10 rounded-none border-muted/60 bg-background pr-12 text-[14px] font-semibold focus-visible:ring-primary/20"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold text-muted-foreground/60">
                                Minutes
                            </div>
                        </div>
                        <p className="text-[12px] font-medium text-muted-foreground/70">
                            Window before orphaned attempts are finalized.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
