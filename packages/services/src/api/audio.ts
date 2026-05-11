import type { AudioAnomalySettings, AudioAnomalySettingsRecord } from '@sentinel/shared';
import type { ApiClientType } from '../api-client';

type AudioSettingsApiResponse = {
    message: string;
    data: AudioAnomalySettingsRecord;
};

export async function getAudioSettings(
    apiClient: ApiClientType,
): Promise<AudioAnomalySettingsRecord> {
    const response: AudioSettingsApiResponse = await apiClient('/settings/audio');
    return response.data;
}

export async function updateAudioSettings(
    apiClient: ApiClientType,
    payload: AudioAnomalySettings,
): Promise<AudioAnomalySettingsRecord> {
    const response: AudioSettingsApiResponse = await apiClient('/settings/audio', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.data;
}
