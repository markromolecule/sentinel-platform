import { type DbClient } from '@sentinel/db';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';
import { getGlobalExaminationSettingsData } from '../data/get-global-settings';
import { parseExaminationGlobalSettingsValue } from '../../../security/access-control/services/parse-examination-global-settings-value';

/**
 * Resolves the effective Support-managed examination defaults from `system_settings`,
 * falling back to the shared code defaults when the row is missing or malformed.
 */
export async function resolveExaminationGlobalSettings(
    dbClient: DbClient,
): Promise<ExaminationGlobalSettings> {
    const row = await getGlobalExaminationSettingsData(dbClient);

    if (!row?.setting_value) {
        return { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS };
    }

    return parseExaminationGlobalSettingsValue(row.setting_value);
}
