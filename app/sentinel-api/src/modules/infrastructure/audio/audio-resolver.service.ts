import {
    audioAnomalyConfigSchema,
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    DEFAULT_AUDIO_ANOMALY_THRESHOLDS,
} from '@sentinel/shared';
import type { DbClient } from '@sentinel/db';
import type { AudioAnomalySettingsRecord } from '@sentinel/shared/types';
import { getAudioSettingsData } from './data/get-audio-settings';
import {
    AUDIO_SETTINGS_CACHE_TTL_MS,
    AUDIO_SETTINGS_CATEGORY,
    AUDIO_SETTINGS_DESCRIPTION,
    AUDIO_SETTINGS_KEY,
} from './audio.constants';

function toNullableDate(value: Date | string | null | undefined) {
    return value ?? null;
}

function buildDisplayName(
    firstName?: string | null,
    lastName?: string | null,
    fallback?: string | null,
) {
    if (firstName || lastName) {
        return `${firstName ?? ''} ${lastName ?? ''}`.trim();
    }

    return fallback ?? null;
}

function cloneDefaultAudioSettings() {
    return {
        ...DEFAULT_AUDIO_ANOMALY_CONFIG,
        thresholds: { ...DEFAULT_AUDIO_ANOMALY_THRESHOLDS },
        enabledAnomalyTypes: [...DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes],
    };
}

type AudioSettingsCacheEntry = {
    record: AudioAnomalySettingsRecord;
    expiresAt: number;
};

export class AudioSettingsResolverService {
    private cache: AudioSettingsCacheEntry | null = null;

    async resolve(dbClient: DbClient): Promise<AudioAnomalySettingsRecord> {
        const now = Date.now();

        if (this.cache && this.cache.expiresAt > now) {
            return this.cache.record;
        }

        const row = await getAudioSettingsData(dbClient, AUDIO_SETTINGS_KEY);
        const record: AudioAnomalySettingsRecord = {
            category: row?.category || AUDIO_SETTINGS_CATEGORY,
            key: AUDIO_SETTINGS_KEY,
            description: row?.description || AUDIO_SETTINGS_DESCRIPTION,
            value: row?.setting_value
                ? audioAnomalyConfigSchema.parse(row.setting_value)
                : cloneDefaultAudioSettings(),
            updatedAt: toNullableDate(row?.updated_at),
            updatedBy: buildDisplayName(
                row?.updater_first_name,
                row?.updater_last_name,
                row?.updated_by ?? null,
            ),
        };

        this.cache = {
            record,
            expiresAt: now + AUDIO_SETTINGS_CACHE_TTL_MS,
        };

        return record;
    }

    invalidate() {
        this.cache = null;
    }

    resetForTests() {
        this.invalidate();
    }
}

export const audioSettingsResolverService = new AudioSettingsResolverService();
