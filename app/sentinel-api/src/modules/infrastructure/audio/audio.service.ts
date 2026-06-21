import type { DbClient } from '@sentinel/db';
import type {
    AudioAnomalySettings,
    AudioAnomalySettingsRecord,
    AudioAnomalySettingsUpdate,
} from '@sentinel/shared/types';
import { audioSettingsResolverService } from './services/audio-resolver.service';
import { upsertAudioSettingsData } from './data/upsert-audio-settings';
import { AUDIO_SETTINGS_KEY } from './audio.constants';

function mergeAudioSettings(
    current: AudioAnomalySettings,
    patch: AudioAnomalySettingsUpdate,
): AudioAnomalySettings {
    return {
        ...current,
        ...patch,
        thresholds: patch.thresholds
            ? {
                  ...current.thresholds,
                  ...patch.thresholds,
              }
            : current.thresholds,
        enabledAnomalyTypes: patch.enabledAnomalyTypes ?? current.enabledAnomalyTypes,
    };
}

export class AudioService {
    static async getAnomalyConfig(dbClient: DbClient): Promise<AudioAnomalySettingsRecord> {
        return audioSettingsResolverService.resolve(dbClient);
    }

    static async updateAnomalyConfig(
        dbClient: DbClient,
        payload: AudioAnomalySettingsUpdate,
        updatedBy?: string | null,
    ): Promise<AudioAnomalySettingsRecord> {
        const current = await this.getAnomalyConfig(dbClient);
        const nextValue = mergeAudioSettings(current.value, payload);

        await upsertAudioSettingsData({
            dbClient,
            settingsKey: AUDIO_SETTINGS_KEY,
            payload: nextValue,
            updatedBy,
        });

        audioSettingsResolverService.invalidate();

        return this.getAnomalyConfig(dbClient);
    }
}
