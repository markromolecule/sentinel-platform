'use client';

import { Switch, cn } from '@sentinel/ui';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

type ToggleKey = keyof Pick<
    ExaminationGlobalSettings,
    | 'defaultShuffleQuestions'
    | 'defaultShowCorrectAnswers'
    | 'defaultAllowReview'
    | 'defaultRandomizeChoices'
    | 'defaultStrictMode'
    | 'defaultCameraRequired'
    | 'defaultMicRequired'
    | 'defaultScreenLock'
>;

const BEHAVIOR_TOGGLES: Array<{ key: ToggleKey; label: string; description: string }> = [
    {
        key: 'defaultShuffleQuestions',
        label: 'Shuffle Questions',
        description: 'Randomize the order of items by default.',
    },
    {
        key: 'defaultRandomizeChoices',
        label: 'Randomize Choices',
        description: 'Mix answer options for supported question types.',
    },
    {
        key: 'defaultAllowReview',
        label: 'Allow Review',
        description: 'Let students navigate back through questions during the attempt.',
    },
    {
        key: 'defaultShowCorrectAnswers',
        label: 'Expose Keys',
        description: 'Reveal correct answers after submission when policy allows.',
    },
];

const ACCESS_TOGGLES: Array<{ key: ToggleKey; label: string; description: string }> = [
    {
        key: 'defaultStrictMode',
        label: 'Strict mode',
        description: 'Apply the full security baseline without relaxed fallbacks.',
    },
    {
        key: 'defaultCameraRequired',
        label: 'Camera required',
        description: 'Require a live video feed before entering the session.',
    },
    {
        key: 'defaultMicRequired',
        label: 'Microphone required',
        description: 'Require microphone permission for monitoring.',
    },
    {
        key: 'defaultScreenLock',
        label: 'Screen lock',
        description: 'Keep the exam surface locked while the session is active.',
    },
];

type BehaviorSettingsViewProps = {
    draft: ExaminationGlobalSettings;
    isPending: boolean;
    updateField: <K extends keyof ExaminationGlobalSettings>(key: K, value: ExaminationGlobalSettings[K]) => void;
};

export function BehaviorSettingsView({ draft, isPending, updateField }: BehaviorSettingsViewProps) {
    return (
        <div className="space-y-16">
            <section className="space-y-8">
                <div>
                    <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                        Attempt Dynamics
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Standardize the default flow and visual behavior of each attempt.
                    </p>
                </div>
                <div className="grid gap-x-12 gap-y-2 lg:grid-cols-2">
                    {BEHAVIOR_TOGGLES.map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-4 rounded-xl border bg-card/30 p-5 transition-colors hover:bg-card/50">
                            <div className="space-y-1">
                                <div className="text-[13px] font-bold text-foreground/90 uppercase tracking-tight">{item.label}</div>
                                <div className="text-muted-foreground text-[11px] font-medium leading-relaxed opacity-70 italic">{item.description}</div>
                            </div>
                            <Switch checked={Boolean(draft[item.key])} onCheckedChange={(c) => updateField(item.key, c as never)} disabled={isPending} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <div>
                    <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                        Access Hardening
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Enforce mandatory security requirements for entrance and participation.
                    </p>
                </div>
                <div className="grid gap-x-12 gap-y-2 lg:grid-cols-2">
                    {ACCESS_TOGGLES.map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-4 rounded-xl border bg-card/30 p-5 transition-colors hover:bg-card/50">
                            <div className="space-y-1">
                                <div className="text-[13px] font-bold text-foreground/90 uppercase tracking-tight">{item.label}</div>
                                <div className="text-muted-foreground text-[11px] font-medium leading-relaxed opacity-70 italic">{item.description}</div>
                            </div>
                            <Switch checked={Boolean(draft[item.key])} onCheckedChange={(c) => updateField(item.key, c as never)} disabled={isPending} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
