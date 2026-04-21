'use client';

import { useMemo, useState } from 'react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    NativeSelect,
    NativeSelectOption,
    Switch,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    cn,
} from '@sentinel/ui';
import {
    DEFAULT_TELEMETRY_SETTINGS,
    MOBILE_TELEMETRY_RULE_KEYS,
    SHARED_TELEMETRY_RULE_KEYS,
    TELEMETRY_INCIDENT_SEVERITIES,
    TELEMETRY_MEDIAPIPE_SANDBOX_V1_EVENT_TYPES,
    TELEMETRY_MEDIAPIPE_SANDBOX_V1_INERT_FIELDS,
    TELEMETRY_MEDIAPIPE_SANDBOX_V1_PREREQUISITES,
    type TelemetryRuleKey,
    type TelemetryIncidentSeverity,
    WEB_TELEMETRY_RULE_KEYS,
} from '@sentinel/shared';
import type {
    TelemetryRuleOverride,
    TelemetrySettings,
    TelemetrySettingsRecord,
} from '@sentinel/shared/types';
import type { TelemetryHealthSnapshot } from '@sentinel/services';
import {
    Activity,
    AlertTriangle,
    Beaker,
    CircleDashed,
    Cpu,
    Save,
    ShieldAlert,
} from 'lucide-react';

type TelemetrySettingsFormProps = {
    record?: TelemetrySettingsRecord;
    health?: TelemetryHealthSnapshot;
    isHealthLoading?: boolean;
    healthError?: Error;
    isPending?: boolean;
    onSubmit: (payload: TelemetrySettings) => void;
};

type RuleGroup = 'ai' | 'web' | 'mobile';

type RuleDefinition = {
    key: TelemetryRuleKey;
    group: RuleGroup;
    label: string;
    description: string;
    supportsConfidence?: boolean;
    supportsDuration?: boolean;
    supportsRepeat?: boolean;
};

type WarningDefinition = {
    title: string;
    description: string;
};

const RULE_DEFINITIONS: RuleDefinition[] = [
    {
        key: 'aiRules.gaze_tracking',
        group: 'ai',
        label: 'Gaze tracking',
        description: 'Track off-screen attention drift and suspicious focus changes.',
        supportsDuration: true,
        supportsRepeat: true,
    },
    {
        key: 'aiRules.face_detection',
        group: 'ai',
        label: 'Face detection',
        description: 'Require a visible student face before escalating face-loss incidents.',
        supportsDuration: true,
        supportsRepeat: true,
    },
    {
        key: 'aiRules.audio_anomaly_detection',
        group: 'ai',
        label: 'Audio anomaly detection',
        description: 'Escalate suspicious voices or noise once confidence or repeat thresholds are met.',
        supportsConfidence: true,
        supportsRepeat: true,
    },
    {
        key: 'aiRules.multiple_faces_detection',
        group: 'ai',
        label: 'Multiple faces detection',
        description: 'Flag other people entering the camera frame based on confidence.',
        supportsConfidence: true,
    },
    {
        key: 'webSecurity.tab_switching_monitor',
        group: 'web',
        label: 'Tab switching monitor',
        description: 'Persist browser focus changes immediately when the exam configuration allows it.',
    },
    {
        key: 'webSecurity.full_screen_required',
        group: 'web',
        label: 'Full-screen required',
        description: 'Persist web full-screen exits as immediate incidents.',
    },
    {
        key: 'webSecurity.clipboard_control',
        group: 'web',
        label: 'Clipboard control',
        description: 'Persist copy and paste attempts immediately on supported clients.',
    },
    {
        key: 'webSecurity.right_click_disable',
        group: 'web',
        label: 'Right-click disable',
        description: 'Persist right-click attempts immediately on the web exam surface.',
    },
    {
        key: 'webSecurity.print_screen_disable',
        group: 'web',
        label: 'Print screen disable',
        description: 'Persist print-screen attempts immediately when the client reports them.',
    },
    {
        key: 'mobileSecurity.app_pinning_required',
        group: 'mobile',
        label: 'App pinning required',
        description: 'Persist app pinning violations immediately on mobile sessions.',
    },
    {
        key: 'mobileSecurity.prevent_backgrounding',
        group: 'mobile',
        label: 'Prevent backgrounding',
        description: 'Persist attempts to leave the mobile exam app immediately.',
    },
    {
        key: 'mobileSecurity.notification_block',
        group: 'mobile',
        label: 'Notification block',
        description: 'Persist notification-related violations immediately on supported devices.',
    },
    {
        key: 'mobileSecurity.screenshot_block',
        group: 'mobile',
        label: 'Screenshot block',
        description: 'Persist screenshot attempts immediately on supported mobile devices.',
    },
    {
        key: 'mobileSecurity.root_jailbreak_detection',
        group: 'mobile',
        label: 'Root / jailbreak detection',
        description: 'Persist compromised-device signals immediately when detected.',
    },
];

const RULE_GROUPS: Array<{
    id: RuleGroup;
    label: string;
    description: string;
    keys: readonly TelemetryRuleKey[];
}> = [
    {
        id: 'ai',
        label: 'AI rules',
        description: 'Threshold-aware rules that can tighten confidence, duration, or repetition requirements.',
        keys: SHARED_TELEMETRY_RULE_KEYS,
    },
    {
        id: 'web',
        label: 'Web rules',
        description: 'Immediate-persist browser safeguards. Severity and disablement are the only active runtime overrides here.',
        keys: WEB_TELEMETRY_RULE_KEYS,
    },
    {
        id: 'mobile',
        label: 'Mobile rules',
        description: 'Immediate-persist mobile safeguards. Severity and disablement are the only active runtime overrides here.',
        keys: MOBILE_TELEMETRY_RULE_KEYS,
    },
];

function createTelemetrySettingsDraft(record?: TelemetrySettingsRecord): TelemetrySettings {
    return {
        version: record?.value.version ?? DEFAULT_TELEMETRY_SETTINGS.version,
        operations: {
            ...DEFAULT_TELEMETRY_SETTINGS.operations,
            ...(record?.value.operations ?? {}),
        },
        ruleOverrides: Object.fromEntries(
            RULE_DEFINITIONS.map((definition) => [
                definition.key,
                { ...(record?.value.ruleOverrides[definition.key] ?? {}) },
            ]),
        ) as TelemetrySettings['ruleOverrides'],
        mediaPipeSandbox: {
            ...DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
            ...(record?.value.mediaPipeSandbox ?? {}),
        },
    };
}

function formatTimestamp(timestamp?: string) {
    if (!timestamp) {
        return 'Not available';
    }

    return new Date(timestamp).toLocaleString();
}

function countConfiguredOverrides(ruleOverrides: TelemetrySettings['ruleOverrides']) {
    return Object.values(ruleOverrides).filter((override) => Object.keys(override).length > 0).length;
}

function countConfiguredOverridesByGroup(
    ruleOverrides: TelemetrySettings['ruleOverrides'],
    group: RuleGroup,
) {
    const groupKeys = RULE_GROUPS.find((item) => item.id === group)?.keys ?? [];

    return groupKeys.filter((key) => Object.keys(ruleOverrides[key] ?? {}).length > 0).length;
}

function cloneSettings(settings: TelemetrySettings): TelemetrySettings {
    return {
        version: settings.version,
        operations: { ...settings.operations },
        ruleOverrides: Object.fromEntries(
            Object.entries(settings.ruleOverrides).map(([ruleKey, override]) => [
                ruleKey,
                { ...override },
            ]),
        ) as TelemetrySettings['ruleOverrides'],
        mediaPipeSandbox: { ...settings.mediaPipeSandbox },
    };
}

function updateRuleOverrideField<K extends keyof TelemetryRuleOverride>(
    settings: TelemetrySettings,
    ruleKey: TelemetryRuleKey,
    field: K,
    value: TelemetryRuleOverride[K],
) {
    const nextOverride = {
        ...settings.ruleOverrides[ruleKey],
        [field]: value,
    };

    if (value === undefined) {
        delete nextOverride[field];
    }

    return {
        ...settings,
        ruleOverrides: {
            ...settings.ruleOverrides,
            [ruleKey]: nextOverride,
        },
    };
}

function parseOptionalNumber(value: string) {
    if (value.trim() === '') {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function buildWarnings(
    settings: TelemetrySettings,
    health?: TelemetryHealthSnapshot,
): WarningDefinition[] {
    const warnings: WarningDefinition[] = [];

    if (!settings.operations.enabled) {
        warnings.push({
            title: 'Telemetry ingestion is globally paused',
            description:
                'Validated events will not be persisted until the global enable switch is turned back on. Saved rule overrides remain stored but inactive while telemetry is disabled.',
        });
    }

    if (!settings.operations.batchingEnabled) {
        warnings.push({
            title: 'Batch controls are currently idle',
            description:
                'With batching disabled, events dispatch individually. The configured batch window and max batch size will not shape bulk buffering.',
        });
    }

    if (
        settings.operations.ingestionMode === 'redis' &&
        health &&
        health.ingestion.mode !== 'redis'
    ) {
        warnings.push({
            title: 'Redis is requested but runtime has fallen back to sync',
            description:
                'The support setting requests Redis ingestion, but the health endpoint is reporting sync mode. This usually means Redis is unavailable or not configured on the active API instance.',
        });
    }

    if (
        !settings.mediaPipeSandbox.enabled &&
        (settings.mediaPipeSandbox.captureDuringCheckup || settings.mediaPipeSandbox.emitDuringExam)
    ) {
        warnings.push({
            title: 'MediaPipe exam and checkup toggles are staged only',
            description:
                'Capture and emission toggles stay inert until the MediaPipe sandbox itself is enabled.',
        });
    }

    if (
        settings.mediaPipeSandbox.enabled &&
        !settings.mediaPipeSandbox.captureDuringCheckup &&
        !settings.mediaPipeSandbox.emitDuringExam
    ) {
        warnings.push({
            title: 'MediaPipe is enabled but not emitting anywhere yet',
            description:
                'The sandbox is on, but both checkup capture and exam emission remain off, so this configuration stays observational only.',
        });
    }

    if (
        settings.mediaPipeSandbox.captureDuringCheckup ||
        settings.mediaPipeSandbox.emitDuringExam
    ) {
        warnings.push({
            title: 'MediaPipe rollout toggles are staged, not live',
            description:
                'In v1, checkup capture and exam emission are stored for future rollout work but remain functionally inert until a dedicated MediaPipe runtime integration phase is delivered.',
        });
    }

    return warnings;
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

function ToggleRow({
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

function LabeledField({
    label,
    description,
    children,
}: {
    label: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-muted-foreground text-xs leading-relaxed">{description}</span>
            {children}
        </label>
    );
}

function OverrideStatusBadge({ override }: { override: TelemetryRuleOverride }) {
    const totalFields = Object.keys(override).length;

    return (
        <Badge variant={totalFields > 0 ? 'default' : 'outline'}>
            {totalFields > 0 ? `${totalFields} override${totalFields > 1 ? 's' : ''}` : 'Inherit'}
        </Badge>
    );
}

function RuleOverrideCard({
    definition,
    override,
    disabled,
    onEnabledChange,
    onSeverityChange,
    onConfidenceChange,
    onDurationChange,
    onRepeatChange,
}: {
    definition: RuleDefinition;
    override: TelemetryRuleOverride;
    disabled?: boolean;
    onEnabledChange: (value: '' | 'true' | 'false') => void;
    onSeverityChange: (value: '' | TelemetryIncidentSeverity) => void;
    onConfidenceChange: (value: string) => void;
    onDurationChange: (value: string) => void;
    onRepeatChange: (value: string) => void;
}) {
    return (
        <Card className="gap-4">
            <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base">{definition.label}</CardTitle>
                        <CardDescription>{definition.description}</CardDescription>
                    </div>
                    <OverrideStatusBadge override={override} />
                </div>
            </CardHeader>

            <CardContent className="grid gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                    <LabeledField
                        label="Runtime enablement"
                        description="Choose whether support leaves this rule alone or explicitly disables it globally."
                    >
                        <NativeSelect
                            value={
                                override.enabled === undefined
                                    ? ''
                                    : override.enabled
                                      ? 'true'
                                      : 'false'
                            }
                            onChange={(event) =>
                                onEnabledChange(event.currentTarget.value as '' | 'true' | 'false')
                            }
                            disabled={disabled}
                        >
                            <NativeSelectOption value="">Inherit exam configuration</NativeSelectOption>
                            <NativeSelectOption value="true">Store explicit enabled</NativeSelectOption>
                            <NativeSelectOption value="false">Disable globally</NativeSelectOption>
                        </NativeSelect>
                    </LabeledField>

                    <LabeledField
                        label="Severity override"
                        description="Keep the incident severity inherited, or pin the persisted severity."
                    >
                        <NativeSelect
                            value={override.severity ?? ''}
                            onChange={(event) =>
                                onSeverityChange(
                                    event.currentTarget.value as '' | TelemetryIncidentSeverity,
                                )
                            }
                            disabled={disabled}
                        >
                            <NativeSelectOption value="">Inherit default severity</NativeSelectOption>
                            {TELEMETRY_INCIDENT_SEVERITIES.map((severity) => (
                                <NativeSelectOption key={severity} value={severity}>
                                    {severity}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </LabeledField>
                </div>

                {(definition.supportsConfidence ||
                    definition.supportsDuration ||
                    definition.supportsRepeat) && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {definition.supportsConfidence ? (
                            <LabeledField
                                label="Confidence threshold"
                                description="Blank means the built-in model threshold remains active."
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step="0.01"
                                    value={override.confidenceThreshold ?? ''}
                                    onChange={(event) => onConfidenceChange(event.currentTarget.value)}
                                    disabled={disabled}
                                />
                            </LabeledField>
                        ) : null}

                        {definition.supportsDuration ? (
                            <LabeledField
                                label="Duration threshold (ms)"
                                description="Blank means the built-in duration threshold remains active."
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={600000}
                                    step="100"
                                    value={override.durationThresholdMs ?? ''}
                                    onChange={(event) => onDurationChange(event.currentTarget.value)}
                                    disabled={disabled}
                                />
                            </LabeledField>
                        ) : null}

                        {definition.supportsRepeat ? (
                            <LabeledField
                                label="Repeat threshold"
                                description="Blank means the built-in repeat threshold remains active."
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    step="1"
                                    value={override.repeatThreshold ?? ''}
                                    onChange={(event) => onRepeatChange(event.currentTarget.value)}
                                    disabled={disabled}
                                />
                            </LabeledField>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function TelemetrySettingsForm({
    record,
    health,
    isHealthLoading,
    healthError,
    isPending,
    onSubmit,
}: TelemetrySettingsFormProps) {
    const [draft, setDraft] = useState<TelemetrySettings | null>(null);

    const syncedDraft = useMemo(() => createTelemetrySettingsDraft(record), [record]);
    const currentDraft = draft ?? syncedDraft;

    const isDirty =
        JSON.stringify(cloneSettings(currentDraft)) !== JSON.stringify(cloneSettings(syncedDraft));
    const warnings = useMemo(
        () => buildWarnings(currentDraft, health),
        [currentDraft, health],
    );

    const healthQueueDepth =
        (health?.ingestion.waiting ?? 0) +
        (health?.ingestion.active ?? 0) +
        (health?.ingestion.buffered ?? 0);
    const lastUpdatedAt = record?.updatedAt ? formatTimestamp(String(record.updatedAt)) : 'Not saved yet';
    const lastUpdatedBy = record?.updatedBy ?? 'Unknown';

    const groupedRules = useMemo(
        () =>
            RULE_GROUPS.map((group) => ({
                ...group,
                definitions: RULE_DEFINITIONS.filter((definition) => definition.group === group.id),
            })),
        [],
    );

    const updateSettings = (updater: (settings: TelemetrySettings) => TelemetrySettings) =>
        setDraft((current) => updater(cloneSettings(current ?? syncedDraft)));

    const handleSubmit = () => {
        onSubmit(cloneSettings(currentDraft));
    };

    return (
        <div className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryTile
                    label="Telemetry"
                    value={currentDraft.operations.enabled ? 'Enabled' : 'Paused'}
                    hint="Global ingestion switch for new telemetry incidents."
                />
                <SummaryTile
                    label="Ingestion"
                    value={currentDraft.operations.ingestionMode.toUpperCase()}
                    hint="Requested runtime transport for ingestion and buffering."
                />
                <SummaryTile
                    label="Overrides"
                    value={`${countConfiguredOverrides(currentDraft.ruleOverrides)} active`}
                    hint="Rule-level overrides currently stored in the global payload."
                />
                <SummaryTile
                    label="Sandbox"
                    value={currentDraft.mediaPipeSandbox.enabled ? 'Enabled' : 'Experimental only'}
                    hint="MediaPipe remains sandboxed and non-authoritative in v1."
                />
            </div>

            <Card className="gap-4">
                <CardHeader>
                    <CardTitle>Settings metadata</CardTitle>
                    <CardDescription>
                        Last persisted change information from the telemetry settings record.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <SummaryTile
                        label="Version"
                        value={String(currentDraft.version)}
                        hint="Schema version stored for the support-managed telemetry payload."
                    />
                    <SummaryTile
                        label="Updated at"
                        value={lastUpdatedAt}
                        hint="Most recent write timestamp returned from system settings."
                    />
                    <SummaryTile
                        label="Updated by"
                        value={lastUpdatedBy}
                        hint="Resolved updater name when available, otherwise the stored user identifier."
                    />
                </CardContent>
            </Card>

            {warnings.length > 0 ? (
                <div className="grid gap-3">
                    {warnings.map((warning) => (
                        <Alert key={warning.title} className="border-amber-500/30 bg-amber-500/5">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{warning.title}</AlertTitle>
                            <AlertDescription>{warning.description}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            ) : null}

            <Tabs defaultValue="operations" className="grid gap-6">
                <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-xl bg-transparent p-0">
                    <TabsTrigger value="operations" className="data-[state=active]:bg-primary/10">
                        <Activity className="size-4" />
                        Operations
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="data-[state=active]:bg-primary/10">
                        <ShieldAlert className="size-4" />
                        Rule Overrides
                    </TabsTrigger>
                    <TabsTrigger value="sandbox" className="data-[state=active]:bg-primary/10">
                        <Beaker className="size-4" />
                        MediaPipe Sandbox
                    </TabsTrigger>
                    <TabsTrigger value="health" className="data-[state=active]:bg-primary/10">
                        <Cpu className="size-4" />
                        Health
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="operations" className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Telemetry operations</CardTitle>
                            <CardDescription>
                                Control the global kill switch, requested ingestion transport, and
                                batch behavior for newly persisted telemetry events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="divide-y">
                                <ToggleRow
                                    label="Enable telemetry ingestion"
                                    description="Stop persisting new telemetry events without changing the upstream client contract."
                                    checked={currentDraft.operations.enabled}
                                    onCheckedChange={(checked) =>
                                        updateSettings((settings) => ({
                                            ...settings,
                                            operations: {
                                                ...settings.operations,
                                                enabled: checked,
                                            },
                                        }))
                                    }
                                    disabled={isPending}
                                />
                                <ToggleRow
                                    label="Enable batching"
                                    description="Allow the ingestion queue to buffer or chunk events instead of dispatching them one by one."
                                    checked={currentDraft.operations.batchingEnabled}
                                    onCheckedChange={(checked) =>
                                        updateSettings((settings) => ({
                                            ...settings,
                                            operations: {
                                                ...settings.operations,
                                                batchingEnabled: checked,
                                            },
                                        }))
                                    }
                                    disabled={isPending}
                                />
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <LabeledField
                                    label="Requested ingestion mode"
                                    description="Choose whether the runtime should prefer direct writes or the Redis-backed queue path."
                                >
                                    <NativeSelect
                                        value={currentDraft.operations.ingestionMode}
                                        onChange={(event) =>
                                            updateSettings((settings) => ({
                                                ...settings,
                                                operations: {
                                                    ...settings.operations,
                                                    ingestionMode: event.currentTarget.value as
                                                        | 'sync'
                                                        | 'redis',
                                                },
                                            }))
                                        }
                                        disabled={isPending}
                                    >
                                        <NativeSelectOption value="sync">
                                            Sync persistence
                                        </NativeSelectOption>
                                        <NativeSelectOption value="redis">
                                            Redis queue
                                        </NativeSelectOption>
                                    </NativeSelect>
                                </LabeledField>

                                <LabeledField
                                    label="Dedupe window (seconds)"
                                    description="Control how long incident persistence treats similar events as part of the same dedupe window."
                                >
                                    <Input
                                        type="number"
                                        min={1}
                                        max={3600}
                                        step="1"
                                        value={currentDraft.operations.dedupeWindowSeconds}
                                        onChange={(event) => {
                                            const parsed = Number(event.currentTarget.value);
                                            if (!Number.isFinite(parsed)) {
                                                return;
                                            }

                                            updateSettings((settings) => ({
                                                ...settings,
                                                operations: {
                                                    ...settings.operations,
                                                    dedupeWindowSeconds: parsed,
                                                },
                                            }));
                                        }}
                                        disabled={isPending}
                                    />
                                </LabeledField>

                                <LabeledField
                                    label="Batch window (ms)"
                                    description="Delay queue dispatch long enough to accumulate batches when batching is enabled."
                                >
                                    <Input
                                        type="number"
                                        min={100}
                                        max={60000}
                                        step="100"
                                        value={currentDraft.operations.batchWindowMs}
                                        onChange={(event) => {
                                            const parsed = Number(event.currentTarget.value);
                                            if (!Number.isFinite(parsed)) {
                                                return;
                                            }

                                            updateSettings((settings) => ({
                                                ...settings,
                                                operations: {
                                                    ...settings.operations,
                                                    batchWindowMs: parsed,
                                                },
                                            }));
                                        }}
                                        disabled={isPending}
                                    />
                                </LabeledField>

                                <LabeledField
                                    label="Max batch size"
                                    description="Split buffered event groups once they hit this many records."
                                >
                                    <Input
                                        type="number"
                                        min={1}
                                        max={500}
                                        step="1"
                                        value={currentDraft.operations.maxBatchSize}
                                        onChange={(event) => {
                                            const parsed = Number(event.currentTarget.value);
                                            if (!Number.isFinite(parsed)) {
                                                return;
                                            }

                                            updateSettings((settings) => ({
                                                ...settings,
                                                operations: {
                                                    ...settings.operations,
                                                    maxBatchSize: parsed,
                                                },
                                            }));
                                        }}
                                        disabled={isPending}
                                    />
                                </LabeledField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rules" className="grid gap-6">
                    <Alert>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Override precedence</AlertTitle>
                        <AlertDescription>
                            Support settings can tighten thresholds, pin severity, or disable a rule
                            globally, but they cannot force a rule to run when the exam
                            configuration has already turned that rule off.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <SummaryTile
                            label="AI"
                            value={`${countConfiguredOverridesByGroup(currentDraft.ruleOverrides, 'ai')} active`}
                            hint="Threshold-aware camera and audio rules."
                        />
                        <SummaryTile
                            label="Web"
                            value={`${countConfiguredOverridesByGroup(currentDraft.ruleOverrides, 'web')} active`}
                            hint="Immediate web-client incident rules."
                        />
                        <SummaryTile
                            label="Mobile"
                            value={`${countConfiguredOverridesByGroup(currentDraft.ruleOverrides, 'mobile')} active`}
                            hint="Immediate mobile-client incident rules."
                        />
                    </div>

                    {groupedRules.map((group) => (
                        <Card key={group.id}>
                            <CardHeader>
                                <CardTitle>{group.label}</CardTitle>
                                <CardDescription>{group.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {group.definitions.map((definition) => {
                                    const override = currentDraft.ruleOverrides[definition.key];

                                    return (
                                        <RuleOverrideCard
                                            key={definition.key}
                                            definition={definition}
                                            override={override}
                                            disabled={isPending}
                                            onEnabledChange={(value) =>
                                                updateSettings((settings) =>
                                                    updateRuleOverrideField(
                                                        settings,
                                                        definition.key,
                                                        'enabled',
                                                        value === ''
                                                            ? undefined
                                                            : value === 'true',
                                                    ),
                                                )
                                            }
                                            onSeverityChange={(value) =>
                                                updateSettings((settings) =>
                                                    updateRuleOverrideField(
                                                        settings,
                                                        definition.key,
                                                        'severity',
                                                        value === '' ? undefined : value,
                                                    ),
                                                )
                                            }
                                            onConfidenceChange={(value) =>
                                                updateSettings((settings) =>
                                                    updateRuleOverrideField(
                                                        settings,
                                                        definition.key,
                                                        'confidenceThreshold',
                                                        parseOptionalNumber(value),
                                                    ),
                                                )
                                            }
                                            onDurationChange={(value) =>
                                                updateSettings((settings) =>
                                                    updateRuleOverrideField(
                                                        settings,
                                                        definition.key,
                                                        'durationThresholdMs',
                                                        parseOptionalNumber(value),
                                                    ),
                                                )
                                            }
                                            onRepeatChange={(value) =>
                                                updateSettings((settings) =>
                                                    updateRuleOverrideField(
                                                        settings,
                                                        definition.key,
                                                        'repeatThreshold',
                                                        parseOptionalNumber(value),
                                                    ),
                                                )
                                            }
                                        />
                                    );
                                })}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="sandbox" className="grid gap-6">
                    <Alert>
                        <Beaker className="h-4 w-4" />
                        <AlertTitle>Experimental rollout only</AlertTitle>
                        <AlertDescription>
                            MediaPipe remains a sandbox configuration in v1. These settings are
                            persisted now so future checkup or exam integrations have a stable
                            source of truth, but they are not a hard enforcement layer today.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>V1 rollout contract</CardTitle>
                            <CardDescription>
                                This sandbox is persisted now, but MediaPipe remains outside the
                                active student checkup and exam runtime until a later rollout phase.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <SummaryTile
                                    label="Allowed signal"
                                    value={TELEMETRY_MEDIAPIPE_SANDBOX_V1_EVENT_TYPES.join(', ')}
                                    hint="The only shared telemetry signal reserved for v1 MediaPipe alignment."
                                />
                                <SummaryTile
                                    label="Runtime scope"
                                    value="No live integration"
                                    hint="Student checkup and exam sessions do not consume this sandbox yet."
                                />
                                <SummaryTile
                                    label="Staged toggles"
                                    value={TELEMETRY_MEDIAPIPE_SANDBOX_V1_INERT_FIELDS.join(', ')}
                                    hint="Schema-present fields intentionally stored as no-op rollout markers in v1."
                                />
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-xl border p-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">
                                            V1 implementation boundary
                                        </div>
                                        <ul className="text-muted-foreground grid gap-2 text-sm">
                                            <li>
                                                MediaPipe configuration persists through telemetry
                                                settings, but no dedicated runtime integration is
                                                enabled for student checkup flows.
                                            </li>
                                            <li>
                                                Exam-time telemetry ingestion does not auto-enable
                                                MediaPipe gaze enforcement from these settings
                                                alone.
                                            </li>
                                            <li>
                                                Future MediaPipe work must map into shared telemetry
                                                instead of creating a parallel event pipeline.
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="rounded-xl border p-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">
                                            Prerequisites before activation
                                        </div>
                                        <ul className="text-muted-foreground grid gap-2 text-sm">
                                            {TELEMETRY_MEDIAPIPE_SANDBOX_V1_PREREQUISITES.map(
                                                (item) => (
                                                    <li key={item}>{item}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>MediaPipe sandbox</CardTitle>
                            <CardDescription>
                                Stage experimental gaze-tracking behavior without coupling it to the
                                active exam runtime.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="divide-y">
                                <ToggleRow
                                    label="Enable MediaPipe sandbox"
                                    description="Keep the sandbox configuration available for future rollout work."
                                    checked={currentDraft.mediaPipeSandbox.enabled}
                                    onCheckedChange={(checked) =>
                                        updateSettings((settings) => ({
                                            ...settings,
                                            mediaPipeSandbox: {
                                                ...settings.mediaPipeSandbox,
                                                enabled: checked,
                                            },
                                        }))
                                    }
                                    disabled={isPending}
                                />
                                <ToggleRow
                                    label="Capture during checkup"
                                    description="Stage checkup-time capture behavior without making it mandatory."
                                    checked={currentDraft.mediaPipeSandbox.captureDuringCheckup}
                                    onCheckedChange={(checked) =>
                                        updateSettings((settings) => ({
                                            ...settings,
                                            mediaPipeSandbox: {
                                                ...settings.mediaPipeSandbox,
                                                captureDuringCheckup: checked,
                                            },
                                        }))
                                    }
                                    disabled={isPending}
                                />
                                <ToggleRow
                                    label="Emit during exam"
                                    description="Stage exam-time MediaPipe emission while the feature remains experimental."
                                    checked={currentDraft.mediaPipeSandbox.emitDuringExam}
                                    onCheckedChange={(checked) =>
                                        updateSettings((settings) => ({
                                            ...settings,
                                            mediaPipeSandbox: {
                                                ...settings.mediaPipeSandbox,
                                                emitDuringExam: checked,
                                            },
                                        }))
                                    }
                                    disabled={isPending}
                                />
                                <ToggleRow
                                    label="Calibration required"
                                    description="Require calibration as part of the eventual sandbox activation workflow."
                                    checked={currentDraft.mediaPipeSandbox.calibrationRequired}
                                    onCheckedChange={(checked) =>
                                        updateSettings((settings) => ({
                                            ...settings,
                                            mediaPipeSandbox: {
                                                ...settings.mediaPipeSandbox,
                                                calibrationRequired: checked,
                                            },
                                        }))
                                    }
                                    disabled={isPending}
                                />
                                <ToggleRow
                                    label="Debug overlay"
                                    description="Expose extra on-screen sandbox diagnostics during experimental testing."
                                    checked={currentDraft.mediaPipeSandbox.debugOverlayEnabled}
                                    onCheckedChange={(checked) =>
                                        updateSettings((settings) => ({
                                            ...settings,
                                            mediaPipeSandbox: {
                                                ...settings.mediaPipeSandbox,
                                                debugOverlayEnabled: checked,
                                            },
                                        }))
                                    }
                                    disabled={isPending}
                                />
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                                <LabeledField
                                    label="Confidence threshold"
                                    description="Minimum model confidence before sandbox gaze signals are considered meaningful."
                                >
                                    <Input
                                        type="number"
                                        min={0}
                                        max={1}
                                        step="0.01"
                                        value={currentDraft.mediaPipeSandbox.confidenceThreshold}
                                        onChange={(event) => {
                                            const parsed = Number(event.currentTarget.value);
                                            if (!Number.isFinite(parsed)) {
                                                return;
                                            }

                                            updateSettings((settings) => ({
                                                ...settings,
                                                mediaPipeSandbox: {
                                                    ...settings.mediaPipeSandbox,
                                                    confidenceThreshold: parsed,
                                                },
                                            }));
                                        }}
                                        disabled={isPending}
                                    />
                                </LabeledField>

                                <LabeledField
                                    label="Frame interval (ms)"
                                    description="Spacing between MediaPipe frame samples when sandbox capture is active."
                                >
                                    <Input
                                        type="number"
                                        min={100}
                                        max={5000}
                                        step="50"
                                        value={currentDraft.mediaPipeSandbox.frameIntervalMs}
                                        onChange={(event) => {
                                            const parsed = Number(event.currentTarget.value);
                                            if (!Number.isFinite(parsed)) {
                                                return;
                                            }

                                            updateSettings((settings) => ({
                                                ...settings,
                                                mediaPipeSandbox: {
                                                    ...settings.mediaPipeSandbox,
                                                    frameIntervalMs: parsed,
                                                },
                                            }));
                                        }}
                                        disabled={isPending}
                                    />
                                </LabeledField>

                                <LabeledField
                                    label="Off-screen duration (ms)"
                                    description="How long a gaze must remain off-screen before the sandbox would consider it actionable."
                                >
                                    <Input
                                        type="number"
                                        min={500}
                                        max={60000}
                                        step="100"
                                        value={currentDraft.mediaPipeSandbox.offScreenDurationMs}
                                        onChange={(event) => {
                                            const parsed = Number(event.currentTarget.value);
                                            if (!Number.isFinite(parsed)) {
                                                return;
                                            }

                                            updateSettings((settings) => ({
                                                ...settings,
                                                mediaPipeSandbox: {
                                                    ...settings.mediaPipeSandbox,
                                                    offScreenDurationMs: parsed,
                                                },
                                            }));
                                        }}
                                        disabled={isPending}
                                    />
                                </LabeledField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health" className="grid gap-6">
                    {healthError ? (
                        <Alert className="border-destructive/30 bg-destructive/5">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Unable to load telemetry health</AlertTitle>
                            <AlertDescription>{healthError.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryTile
                            label="Status"
                            value={isHealthLoading ? 'Loading...' : (health?.status ?? 'Unknown')}
                            hint="Latest health snapshot returned by the telemetry monitoring route."
                        />
                        <SummaryTile
                            label="Runtime mode"
                            value={
                                isHealthLoading
                                    ? 'Loading...'
                                    : (health?.ingestion.mode?.toUpperCase() ?? 'Unknown')
                            }
                            hint="Actual ingestion mode reported by the active API instance."
                        />
                        <SummaryTile
                            label="Queue depth"
                            value={isHealthLoading ? 'Loading...' : String(healthQueueDepth)}
                            hint="Buffered, waiting, and active work currently visible to the health route."
                        />
                        <SummaryTile
                            label="Last known status"
                            value={isHealthLoading ? 'Loading...' : formatTimestamp(health?.timestamp)}
                            hint="When the latest health snapshot was generated."
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Operational snapshot</CardTitle>
                            <CardDescription>
                                Live queue and ingestion values returned by <code>/telemetry/health</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="divide-y border-y">
                                {[
                                    ['Requested mode', currentDraft.operations.ingestionMode],
                                    ['Reported mode', health?.ingestion.mode ?? 'Unavailable'],
                                    ['Queue name', health?.ingestion.queueName ?? 'Not attached'],
                                    ['Buffer name', health?.ingestion.bufferName ?? 'Not attached'],
                                    ['Waiting jobs', String(health?.ingestion.waiting ?? 0)],
                                    ['Active jobs', String(health?.ingestion.active ?? 0)],
                                    ['Buffered events', String(health?.ingestion.buffered ?? 0)],
                                    ['Failed jobs', String(health?.ingestion.failed ?? 0)],
                                    ['Completed jobs', String(health?.ingestion.completed ?? 0)],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="grid gap-1 py-4 md:grid-cols-[0.8fr_1.2fr]"
                                    >
                                        <div className="text-sm font-medium">{label}</div>
                                        <div className="text-muted-foreground text-sm">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className="gap-4">
                <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant={isDirty ? 'default' : 'outline'}>
                                {isDirty ? 'Unsaved changes' : 'No pending changes'}
                            </Badge>
                            <span className="text-muted-foreground text-sm">
                                Full-replace save semantics are active for this settings payload.
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Saving replaces the full telemetry settings object, including rule
                            overrides and sandbox fields.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDraft(null)}
                            disabled={!isDirty || isPending}
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isDirty || isPending}
                            className={cn('min-w-40', isPending && 'pointer-events-none')}
                        >
                            {isPending ? (
                                <>
                                    <CircleDashed className="size-4 animate-spin" />
                                    Saving settings...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Save telemetry settings
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
