import { type DbClient } from '@sentinel/db';

export async function getAudioSettingsData(dbClient: DbClient, settingsKey: string) {
    return dbClient
        .selectFrom('system_settings as settings')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'settings.updated_by')
        .select([
            'settings.category',
            'settings.setting_key',
            'settings.setting_value',
            'settings.description',
            'settings.updated_at',
            'settings.updated_by',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ])
        .where('settings.setting_key', '=', settingsKey)
        .executeTakeFirst();
}
