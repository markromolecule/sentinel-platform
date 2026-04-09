import { type DbClient } from '@sentinel/db';

export async function getExaminationGlobalSettingsData(dbClient: DbClient, settingsKey: string) {
    return dbClient
        .selectFrom('system_settings')
        .selectAll()
        .where('setting_key', '=', settingsKey)
        .executeTakeFirst();
}
