import { DEFAULT_TELEMETRY_SETTINGS, telemetrySettingsSchema } from '@sentinel/shared';
import type { DbClient } from '@sentinel/db';
import type { TelemetrySettingsRecord } from '@sentinel/shared/types';
import { getTelemetrySettingsData } from './data/get-telemetry-settings';
import {
    TELEMETRY_SETTINGS_CACHE_TTL_MS,
    TELEMETRY_SETTINGS_CATEGORY,
    TELEMETRY_SETTINGS_DESCRIPTION,
    TELEMETRY_SETTINGS_KEY,
} from './settings.constants';

function toNullableDate(value: Date | string | null | undefined) {
    return value ?? null;
}

function cloneDefaultTelemetrySettings() {
    return {
        ...DEFAULT_TELEMETRY_SETTINGS,
        operations: { ...DEFAULT_TELEMETRY_SETTINGS.operations },
        ruleOverrides: Object.fromEntries(
            Object.entries(DEFAULT_TELEMETRY_SETTINGS.ruleOverrides).map(([ruleKey, override]) => [
                ruleKey,
                { ...override },
            ]),
        ) as TelemetrySettingsRecord['value']['ruleOverrides'],
        mediaPipeSandbox: { ...DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox },
    };
}

type TelemetrySettingsCacheEntry = {
    record: TelemetrySettingsRecord;
    expiresAt: number;
};

export class TelemetrySettingsResolverService {
    private cache: TelemetrySettingsCacheEntry | null = null;

    async resolve(dbClient: DbClient): Promise<TelemetrySettingsRecord> {
        const now = Date.now();

        if (this.cache && this.cache.expiresAt > now) {
            return this.cache.record;
        }

        const row = await getTelemetrySettingsData(dbClient, TELEMETRY_SETTINGS_KEY);
        const record: TelemetrySettingsRecord = {
            category: row?.category || TELEMETRY_SETTINGS_CATEGORY,
            key: TELEMETRY_SETTINGS_KEY,
            description: row?.description || TELEMETRY_SETTINGS_DESCRIPTION,
            value: row?.setting_value
                ? telemetrySettingsSchema.parse(row.setting_value)
                : cloneDefaultTelemetrySettings(),
            updatedAt: toNullableDate(row?.updated_at),
        };

        // Multi-instance deployments are eventually consistent within this TTL window.
        this.cache = {
            record,
            expiresAt: now + TELEMETRY_SETTINGS_CACHE_TTL_MS,
        };

        return record;
    }

    invalidate(): void {
        this.cache = null;
    }

    resetForTests(): void {
        this.invalidate();
    }
}

export const telemetrySettingsResolverService = new TelemetrySettingsResolverService();
