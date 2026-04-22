import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';
import type { TelemetrySettings, TelemetryRuleOverride, TelemetryRuleKey } from '@sentinel/shared';
import type { TelemetrySettingsRecord } from '@sentinel/shared/types';
import type { TelemetryHealthSnapshot } from '@sentinel/services';
import type { RuleGroup, WarningDefinition } from './telemetry-types';
import { RULE_DEFINITIONS, RULE_GROUPS } from './telemetry-types';

export function createTelemetrySettingsDraft(record?: TelemetrySettingsRecord): TelemetrySettings {
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

export function formatTimestamp(timestamp?: string): string {
    if (!timestamp) return 'Not available';
    return new Date(timestamp).toLocaleString();
}

export function countConfiguredOverrides(
    ruleOverrides: TelemetrySettings['ruleOverrides'],
): number {
    return Object.values(ruleOverrides).filter((override) => Object.keys(override).length > 0)
        .length;
}

export function countConfiguredOverridesByGroup(
    ruleOverrides: TelemetrySettings['ruleOverrides'],
    group: RuleGroup,
): number {
    const groupKeys = RULE_GROUPS.find((item) => item.id === group)?.keys ?? [];
    return groupKeys.filter((key) => Object.keys(ruleOverrides[key] ?? {}).length > 0).length;
}

export function cloneSettings(settings: TelemetrySettings): TelemetrySettings {
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

export function updateRuleOverrideField<K extends keyof TelemetryRuleOverride>(
    settings: TelemetrySettings,
    ruleKey: TelemetryRuleKey,
    field: K,
    value: TelemetryRuleOverride[K],
): TelemetrySettings {
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

export function parseOptionalNumber(value: string): number | undefined {
    if (value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildWarnings(
    settings: TelemetrySettings,
    health?: TelemetryHealthSnapshot,
): WarningDefinition[] {
    const warnings: WarningDefinition[] = [];

    if (!settings.operations.enabled) {
        warnings.push({
            title: 'Telemetry ingestion is globally paused',
            description:
                'Validated events will not be persisted until the global enable switch is turned back on.',
        });
    }

    if (!settings.operations.batchingEnabled) {
        warnings.push({
            title: 'Batch controls are currently idle',
            description:
                'With batching disabled, events dispatch individually. Batch window and max batch size settings are inactive.',
        });
    }

    if (
        settings.operations.ingestionMode === 'redis' &&
        health &&
        health.ingestion.mode !== 'redis'
    ) {
        warnings.push({
            title: 'Redis requested but runtime has fallen back to sync',
            description:
                'The support setting requests Redis ingestion, but the health endpoint reports sync mode. Redis may be unavailable.',
        });
    }

    if (
        !settings.mediaPipeSandbox.enabled &&
        (settings.mediaPipeSandbox.captureDuringCheckup || settings.mediaPipeSandbox.emitDuringExam)
    ) {
        warnings.push({
            title: 'MediaPipe rollout toggles need the sandbox enabled',
            description:
                'Checkup capture and attempt emission are saved, but they only become active after the core MediaPipe sandbox switch is turned on.',
        });
    }

    if (
        settings.mediaPipeSandbox.enabled &&
        !settings.mediaPipeSandbox.captureDuringCheckup &&
        !settings.mediaPipeSandbox.emitDuringExam
    ) {
        warnings.push({
            title: 'MediaPipe enabled but not emitting',
            description:
                'The sandbox is on, but both checkup capture and exam emission remain off — observational only.',
        });
    }

    if (
        settings.mediaPipeSandbox.captureDuringCheckup ||
        settings.mediaPipeSandbox.emitDuringExam
    ) {
        warnings.push({
            title: 'MediaPipe rollout now affects downstream student phases',
            description:
                'Support-managed rollout settings should be validated in the sandbox before they are relied on in student checkup or attempt flows.',
        });
    }

    return warnings;
}
