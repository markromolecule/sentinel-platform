'use client';

import { useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Input,
    Separator,
    Switch,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@sentinel/ui';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type {
    ExaminationGlobalSettings,
    ExaminationGlobalSettingsRecord,
} from '@sentinel/shared/types';
import { AccessControlSection } from './access-control-section';

function createDefaultSettingsDraft(): ExaminationGlobalSettings {
    return {
        ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
        defaultAiRules: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAiRules },
        defaultWebSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity },
        defaultMobileSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMobileSecurity },
    };
}

type ExaminationSettingsFormProps = {
    record?: ExaminationGlobalSettingsRecord;
    isPending?: boolean;
    onSubmit: (payload: ExaminationGlobalSettings) => void;
};

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

type NestedRuleSection = 'defaultAiRules' | 'defaultWebSecurity' | 'defaultMobileSecurity';

type NestedRuleItem<TSection extends NestedRuleSection> = {
    key: keyof ExaminationGlobalSettings[TSection];
    label: string;
    description: string;
};

const BEHAVIOR_TOGGLES: Array<{ key: ToggleKey; label: string; description: string }> = [
    {
        key: 'defaultShuffleQuestions',
        label: 'Shuffle questions',
        description: 'Randomize the order of items by default.',
    },
    {
        key: 'defaultRandomizeChoices',
        label: 'Randomize choices',
        description: 'Mix answer options for supported question types.',
    },
    {
        key: 'defaultAllowReview',
        label: 'Allow review',
        description: 'Let students navigate back through questions during the attempt.',
    },
    {
        key: 'defaultShowCorrectAnswers',
        label: 'Show correct answers',
        description: 'Expose answer keys after submission when the exam policy allows it.',
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

const AI_RULES: NestedRuleItem<'defaultAiRules'>[] = [
    {
        key: 'gaze_tracking',
        label: 'Gaze tracking',
        description: 'Monitor off-screen attention drift and focus changes.',
    },
    {
        key: 'face_detection',
        label: 'Face detection',
        description: 'Require a visible student face during the attempt.',
    },
    {
        key: 'audio_anomaly_detection',
        label: 'Audio anomaly detection',
        description: 'Flag unexpected voices or suspicious sounds.',
    },
    {
        key: 'multiple_faces_detection',
        label: 'Multiple faces detection',
        description: 'Detect other people entering the camera frame.',
    },
];

const WEB_RULES: NestedRuleItem<'defaultWebSecurity'>[] = [
    {
        key: 'tab_switching_monitor',
        label: 'Tab switching monitor',
        description: 'Track browser focus changes and tab switching.',
    },
    {
        key: 'full_screen_required',
        label: 'Full-screen required',
        description: 'Require the web exam to stay in full-screen mode.',
    },
    {
        key: 'clipboard_control',
        label: 'Clipboard control',
        description: 'Restrict copy and paste actions on the web client.',
    },
    {
        key: 'right_click_disable',
        label: 'Right-click disable',
        description: 'Reduce access to browser context tools during the session.',
    },
    {
        key: 'print_screen_disable',
        label: 'Print screen disable',
        description: 'Block or discourage screenshot shortcuts where supported.',
    },
];

const MOBILE_RULES: NestedRuleItem<'defaultMobileSecurity'>[] = [
    {
        key: 'app_pinning_required',
        label: 'App pinning required',
        description: 'Keep the mobile exam app pinned in the foreground.',
    },
    {
        key: 'prevent_backgrounding',
        label: 'Prevent backgrounding',
        description: 'Flag attempts to leave the exam app during the session.',
    },
    {
        key: 'notification_block',
        label: 'Notification block',
        description: 'Reduce interruption risk from notifications and overlays.',
    },
    {
        key: 'screenshot_block',
        label: 'Screenshot block',
        description: 'Block screenshots and recordings on supported devices.',
    },
    {
        key: 'root_jailbreak_detection',
        label: 'Root / jailbreak detection',
        description: 'Detect compromised devices that weaken the security baseline.',
    },
];

function countEnabledFlags(flags: Record<string, boolean>) {
    return Object.values(flags).filter(Boolean).length;
}

function SummaryTile({ label, value, hint }: { label: string; value: string; hint: string }) {
    return (
        <div className="bg-muted/20 rounded-xl border p-4">
            <div className="space-y-1">
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {label}
                </div>
                <div className="text-sm font-semibold">{value}</div>
                <div className="text-muted-foreground text-xs leading-relaxed">{hint}</div>
            </div>
        </div>
    );
}

function ToggleListItem({
    label,
    description,
    checked,
    onCheckedChange,
    disabled,
}: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="space-y-0.5">
                <div className="text-sm font-medium">{label}</div>
                <p className="text-muted-foreground text-xs leading-snug">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
        </div>
    );
}

function NestedToggleList<TSection extends NestedRuleSection>({
    items,
    section,
    draft,
    disabled,
    updateNestedField,
}: {
    items: NestedRuleItem<TSection>[];
    section: TSection;
    draft: ExaminationGlobalSettings;
    disabled?: boolean;
    updateNestedField: <
        TTargetSection extends NestedRuleSection,
        TKey extends keyof ExaminationGlobalSettings[TTargetSection],
    >(
        section: TTargetSection,
        key: TKey,
        value: ExaminationGlobalSettings[TTargetSection][TKey],
    ) => void;
}) {
    return (
        <div className="divide-y">
            {items.map((item) => (
                <ToggleListItem
                    key={`${section}.${String(item.key)}`}
                    label={item.label}
                    description={item.description}
                    checked={Boolean(draft[section][item.key])}
                    onCheckedChange={(checked) =>
                        updateNestedField(section, item.key, checked as never)
                    }
                    disabled={disabled}
                />
            ))}
        </div>
    );
}

export function ExaminationSettingsForm({
    record,
    isPending,
    onSubmit,
}: ExaminationSettingsFormProps) {
    const [draft, setDraft] = useState<ExaminationGlobalSettings | null>(null);

    const syncedDraft = useMemo<ExaminationGlobalSettings>(() => {
        if (!record) {
            return createDefaultSettingsDraft();
        }

        return {
            ...record.value,
            defaultAiRules: {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAiRules,
                ...record.value.defaultAiRules,
            },
            defaultWebSecurity: {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity,
                ...record.value.defaultWebSecurity,
            },
            defaultMobileSecurity: {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMobileSecurity,
                ...record.value.defaultMobileSecurity,
            },
        };
    }, [record]);

    const currentDraft = draft ?? syncedDraft;

    const updateField = <K extends keyof ExaminationGlobalSettings>(
        key: K,
        value: ExaminationGlobalSettings[K],
    ) =>
        setDraft((current) => {
            const base = current ?? syncedDraft;
            return { ...base, [key]: value };
        });

    const updateNestedField = <
        TSection extends NestedRuleSection,
        TKey extends keyof ExaminationGlobalSettings[TSection],
    >(
        section: TSection,
        key: TKey,
        value: ExaminationGlobalSettings[TSection][TKey],
    ) =>
        setDraft((current) => ({
            ...(current ?? syncedDraft),
            [section]: {
                ...(current ?? syncedDraft)[section],
                [key]: value,
            },
        }));

    const accessSummary = [
        currentDraft.defaultCameraRequired ? 'camera' : null,
        currentDraft.defaultMicRequired ? 'microphone' : null,
        currentDraft.defaultStrictMode ? 'strict mode' : null,
        currentDraft.defaultScreenLock ? 'screen lock' : null,
    ].filter(Boolean);

    return (
        <div className="grid gap-6">
            <AccessControlSection
                title="Examination Baseline Overview"
                description="Global defaults that seed new exam security and behavior settings across the platform."
            >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryTile
                        label="Access"
                        value={
                            accessSummary.length > 0 ? accessSummary.join(', ') : 'Flexible access'
                        }
                        hint="Baseline permissions and lock-in rules."
                    />
                    <SummaryTile
                        label="Interruption"
                        value={`${currentDraft.defaultMaxReconnectAttempts} reconnects / ${currentDraft.defaultAutoSubmitTimeoutMinutes}m`}
                        hint="Tolerance for connectivity issues."
                    />
                    <SummaryTile
                        label="AI Coverage"
                        value={`${countEnabledFlags(currentDraft.defaultAiRules)} rules active`}
                        hint="Automated monitoring across platforms."
                    />
                    <SummaryTile
                        label="Safeguards"
                        value={`${countEnabledFlags(currentDraft.defaultWebSecurity)} web / ${countEnabledFlags(currentDraft.defaultMobileSecurity)} mobile`}
                        hint="Platform-specific security controls."
                    />
                </div>
            </AccessControlSection>

            <AccessControlSection
                title="General Configuration"
                description="Core settings for timing, scoring, and basic attempt behavior."
            >
                <div className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="space-y-1.5">
                            <span className="text-muted-foreground text-xs font-semibold uppercase">
                                Duration (min)
                            </span>
                            <Input
                                type="number"
                                min={1}
                                value={currentDraft.defaultDurationMinutes}
                                onChange={(event) =>
                                    updateField(
                                        'defaultDurationMinutes',
                                        Number(event.target.value) || 0,
                                    )
                                }
                                disabled={isPending}
                            />
                        </label>
                        <label className="space-y-1.5">
                            <span className="text-muted-foreground text-xs font-semibold uppercase">
                                Passing Score (%)
                            </span>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={currentDraft.defaultPassingScore}
                                onChange={(event) =>
                                    updateField(
                                        'defaultPassingScore',
                                        Number(event.target.value) || 0,
                                    )
                                }
                                disabled={isPending}
                            />
                        </label>
                        <label className="space-y-1.5">
                            <span className="text-muted-foreground text-xs font-semibold uppercase">
                                Reconnects
                            </span>
                            <Input
                                type="number"
                                min={0}
                                value={currentDraft.defaultMaxReconnectAttempts}
                                onChange={(event) =>
                                    updateField(
                                        'defaultMaxReconnectAttempts',
                                        Number(event.target.value) || 0,
                                    )
                                }
                                disabled={isPending}
                            />
                        </label>
                        <label className="space-y-1.5">
                            <span className="text-muted-foreground text-xs font-semibold uppercase">
                                Auto-submit (min)
                            </span>
                            <Input
                                type="number"
                                min={0}
                                value={currentDraft.defaultAutoSubmitTimeoutMinutes}
                                onChange={(event) =>
                                    updateField(
                                        'defaultAutoSubmitTimeoutMinutes',
                                        Number(event.target.value) || 0,
                                    )
                                }
                                disabled={isPending}
                            />
                        </label>
                    </div>

                    <Separator />

                    <div className="grid gap-x-12 gap-y-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold">Attempt Behavior</h3>
                                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                                    Default
                                </Badge>
                            </div>
                            <div className="divide-y border-y">
                                {BEHAVIOR_TOGGLES.map((item) => (
                                    <ToggleListItem
                                        key={item.key}
                                        label={item.label}
                                        description={item.description}
                                        checked={Boolean(currentDraft[item.key])}
                                        onCheckedChange={(checked) =>
                                            updateField(item.key, checked as never)
                                        }
                                        disabled={isPending}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold">Access Requirements</h3>
                                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                                    Mandatory
                                </Badge>
                            </div>
                            <div className="divide-y border-y">
                                {ACCESS_TOGGLES.map((item) => (
                                    <ToggleListItem
                                        key={item.key}
                                        label={item.label}
                                        description={item.description}
                                        checked={Boolean(currentDraft[item.key])}
                                        onCheckedChange={(checked) =>
                                            updateField(item.key, checked as never)
                                        }
                                        disabled={isPending}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AccessControlSection>

            <AccessControlSection
                title="Platform Safeguards & Monitoring"
                description="Specific protections for Web and Mobile clients, alongside shared AI monitoring signals."
            >
                <Tabs defaultValue="web" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="web">Web Client</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile App</TabsTrigger>
                        <TabsTrigger value="ai">AI Monitoring</TabsTrigger>
                    </TabsList>

                    <TabsContent value="web" className="mt-0">
                        <div className="bg-muted/5 rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-foreground text-sm font-semibold">
                                        Web Safeguards
                                    </h3>
                                    <p className="text-muted-foreground text-xs">
                                        Protections applied to browser-based exam sessions.
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {countEnabledFlags(currentDraft.defaultWebSecurity)} Active
                                </Badge>
                            </div>
                            <NestedToggleList
                                items={WEB_RULES}
                                section="defaultWebSecurity"
                                draft={currentDraft}
                                disabled={isPending}
                                updateNestedField={updateNestedField}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="mobile" className="mt-0">
                        <div className="bg-muted/5 rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-foreground text-sm font-semibold">
                                        Mobile Safeguards
                                    </h3>
                                    <p className="text-muted-foreground text-xs">
                                        Protections for Expo/React Native mobile client.
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {countEnabledFlags(currentDraft.defaultMobileSecurity)} Active
                                </Badge>
                            </div>
                            <NestedToggleList
                                items={MOBILE_RULES}
                                section="defaultMobileSecurity"
                                draft={currentDraft}
                                disabled={isPending}
                                updateNestedField={updateNestedField}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0">
                        <div className="bg-muted/5 rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-foreground text-sm font-semibold">
                                        AI Monitoring Signals
                                    </h3>
                                    <p className="text-muted-foreground text-xs">
                                        Shared monitoring rules that apply across all platforms.
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {countEnabledFlags(currentDraft.defaultAiRules)} Active
                                </Badge>
                            </div>
                            <NestedToggleList
                                items={AI_RULES}
                                section="defaultAiRules"
                                draft={currentDraft}
                                disabled={isPending}
                                updateNestedField={updateNestedField}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </AccessControlSection>

            <div className="sticky bottom-4 z-10 mt-2">
                <div className="bg-background/95 flex flex-col gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md md:flex-row md:items-center md:justify-between">
                    <div className="text-muted-foreground text-xs">
                        {record?.updatedAt
                            ? `Last updated ${new Date(record.updatedAt).toLocaleString()}`
                            : 'These defaults will be saved as the global examination baseline.'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDraft(null)}
                            disabled={isPending || !draft}
                        >
                            Discard changes
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onSubmit(currentDraft)}
                            disabled={isPending}
                        >
                            {isPending ? 'Saving...' : 'Save global defaults'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
