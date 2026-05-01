import { type DbClient } from '@sentinel/db';

export const EXAMINATION_SETTINGS_KEY = 'examination.global_defaults';

export async function getGlobalExaminationSettingsData(dbClient: DbClient) {
    return await dbClient
        .selectFrom('system_settings')
        .selectAll()
        .where('setting_key', '=', EXAMINATION_SETTINGS_KEY)
        .executeTakeFirst();
}
