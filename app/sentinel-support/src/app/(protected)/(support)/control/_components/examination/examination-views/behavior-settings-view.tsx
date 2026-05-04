import { Switch } from '@sentinel/ui';
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
    updateField: <K extends keyof ExaminationGlobalSettings>(
        key: K,
        value: ExaminationGlobalSettings[K],
    ) => void;
};

export function BehaviorSettingsView({ draft, isPending, updateField }: BehaviorSettingsViewProps) {
    return (
        <div className="space-y-12">
            <section className="space-y-8">
                <div className="space-y-1.5">
                    <h3 className="text-muted-foreground/80 text-[12px] font-semibold">
                        Attempt Dynamics
                    </h3>
                    <p className="text-foreground text-[14px] font-semibold">
                        Standardize the default flow and visual behavior of each attempt.
                    </p>
                </div>
                <div className="grid grid-cols-1 border-t border-l sm:grid-cols-2">
                    {BEHAVIOR_TOGGLES.map((item) => (
                        <div
                            key={item.key}
                            className="bg-background hover:bg-muted/5 flex items-start justify-between gap-4 border-r border-b p-5 transition-colors"
                        >
                            <div className="space-y-1">
                                <div className="text-foreground text-[14px] font-semibold">
                                    {item.label}
                                </div>
                                <div className="text-muted-foreground text-[12px] leading-relaxed font-medium opacity-70">
                                    {item.description}
                                </div>
                            </div>
                            <Switch
                                checked={Boolean(draft[item.key])}
                                onCheckedChange={(c) => updateField(item.key, c as never)}
                                disabled={isPending}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <div className="space-y-1.5">
                    <h3 className="text-muted-foreground/80 text-[12px] font-semibold">
                        Access Hardening
                    </h3>
                    <p className="text-foreground text-[14px] font-semibold">
                        Enforce mandatory security requirements for entrance and participation.
                    </p>
                </div>
                <div className="grid grid-cols-1 border-t border-l sm:grid-cols-2">
                    {ACCESS_TOGGLES.map((item) => (
                        <div
                            key={item.key}
                            className="bg-background hover:bg-muted/5 flex items-start justify-between gap-4 border-r border-b p-5 transition-colors"
                        >
                            <div className="space-y-1">
                                <div className="text-foreground text-[14px] font-semibold">
                                    {item.label}
                                </div>
                                <div className="text-muted-foreground text-[12px] leading-relaxed font-medium opacity-70">
                                    {item.description}
                                </div>
                            </div>
                            <Switch
                                checked={Boolean(draft[item.key])}
                                onCheckedChange={(c) => updateField(item.key, c as never)}
                                disabled={isPending}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
