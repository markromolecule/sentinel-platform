'use client';

import { Input } from '@sentinel/ui';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

type GeneralSettingsViewProps = {
    draft: ExaminationGlobalSettings;
    isPending: boolean;
    updateField: <K extends keyof ExaminationGlobalSettings>(
        key: K,
        value: ExaminationGlobalSettings[K],
    ) => void;
};

export function GeneralSettingsView({ draft, isPending, updateField }: GeneralSettingsViewProps) {
    return (
        <div className="space-y-10">
            <div className="space-y-1.5">
                <h3 className="text-muted-foreground/80 text-[12px] font-semibold">
                    General Baseline
                </h3>
                <p className="text-foreground text-[14px] font-semibold">
                    Core configurations for timing, scoring, and continuity.
                </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <span className="text-muted-foreground/80 text-[12px] font-semibold">
                            Default Duration
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={1}
                                value={draft.defaultDurationMinutes}
                                onChange={(e) =>
                                    updateField(
                                        'defaultDurationMinutes',
                                        Number(e.target.value) || 0,
                                    )
                                }
                                disabled={isPending}
                                className="border-muted/60 bg-background focus-visible:ring-primary/20 h-10 rounded-none pr-12 text-[14px] font-semibold"
                            />
                            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold">
                                Minutes
                            </div>
                        </div>
                        <p className="text-muted-foreground/70 text-[12px] font-medium">
                            Initial time allocated for new exam instances.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-muted-foreground/80 text-[12px] font-semibold">
                            Passing Score
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={draft.defaultPassingScore}
                                onChange={(e) =>
                                    updateField('defaultPassingScore', Number(e.target.value) || 0)
                                }
                                disabled={isPending}
                                className="border-muted/60 bg-background focus-visible:ring-primary/20 h-10 rounded-none pr-12 text-[14px] font-semibold"
                            />
                            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold">
                                Percent
                            </div>
                        </div>
                        <p className="text-muted-foreground/70 text-[12px] font-medium">
                            The minimum threshold required for success.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <span className="text-muted-foreground/80 text-[12px] font-semibold">
                            Max Reconnect Attempts
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                value={draft.defaultMaxReconnectAttempts}
                                onChange={(e) =>
                                    updateField(
                                        'defaultMaxReconnectAttempts',
                                        Number(e.target.value) || 0,
                                    )
                                }
                                disabled={isPending}
                                className="border-muted/60 bg-background focus-visible:ring-primary/20 h-10 rounded-none pr-12 text-[14px] font-semibold"
                            />
                            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold">
                                Tries
                            </div>
                        </div>
                        <p className="text-muted-foreground/70 text-[12px] font-medium">
                            Allowance for network instability before termination.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-muted-foreground/80 text-[12px] font-semibold">
                            Auto-Submit Timeout
                        </span>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                value={draft.defaultAutoSubmitTimeoutMinutes}
                                onChange={(e) =>
                                    updateField(
                                        'defaultAutoSubmitTimeoutMinutes',
                                        Number(e.target.value) || 0,
                                    )
                                }
                                disabled={isPending}
                                className="border-muted/60 bg-background focus-visible:ring-primary/20 h-10 rounded-none pr-12 text-[14px] font-semibold"
                            />
                            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 right-4 flex items-center text-[12px] font-semibold">
                                Minutes
                            </div>
                        </div>
                        <p className="text-muted-foreground/70 text-[12px] font-medium">
                            Window before orphaned attempts are finalized.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
