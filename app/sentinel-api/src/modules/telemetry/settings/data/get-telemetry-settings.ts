import { type DbClient } from '@sentinel/db';

export async function getTelemetrySettingsData(dbClient: DbClient, settingsKey: string) {
    return dbClient
        .selectFrom('system_settings')
        .selectAll()
        .where('setting_key', '=', settingsKey)
        .executeTakeFirst();
}
