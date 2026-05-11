import { type DbClient } from '@sentinel/db';
import type { AudioAnomalySettings } from '@sentinel/shared/types';
import { AUDIO_SETTINGS_CATEGORY, AUDIO_SETTINGS_DESCRIPTION } from '../audio.constants';

export async function upsertAudioSettingsData(args: {
    dbClient: DbClient;
    settingsKey: string;
    payload: AudioAnomalySettings;
    updatedBy?: string | null;
}) {
    const { dbClient, settingsKey, payload, updatedBy } = args;

    await dbClient
        .insertInto('system_settings')
        .values({
            category: AUDIO_SETTINGS_CATEGORY,
            setting_key: settingsKey,
            setting_value: payload as any,
            description: AUDIO_SETTINGS_DESCRIPTION,
            updated_at: new Date(),
            updated_by: updatedBy || null,
        })
        .onConflict((oc) =>
            oc.column('setting_key').doUpdateSet({
                category: AUDIO_SETTINGS_CATEGORY,
                setting_value: payload as any,
                description: AUDIO_SETTINGS_DESCRIPTION,
                updated_at: new Date(),
                updated_by: updatedBy || null,
            }),
        )
        .execute();
}
