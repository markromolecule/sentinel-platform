import { type DbClient } from '@sentinel/db';
import type {
    ExaminationGlobalSettings,
    ExaminationGlobalSettingsRecord,
} from '@sentinel/shared/types';
import { getExaminationGlobalSettingsData } from '../data/get-examination-global-settings';
import { upsertExaminationGlobalSettingsData } from '../data/upsert-examination-global-settings';
import { ensureAccessControlCatalogs } from './access-control-catalog.service';
import { EXAMINATION_SETTINGS_KEY } from './access-control-overview.service';
import { resolveExaminationGlobalSettings } from '../../../examination/configuration/services/resolve-examination-global-settings.service';
export { parseExaminationGlobalSettingsValue } from './parse-examination-global-settings-value';

function toNullableDate(value: Date | string | null | undefined) {
    return value ?? null;
}

export class AccessControlExaminationSettingsService {
    static async getExaminationSettings(
        dbClient: DbClient,
    ): Promise<ExaminationGlobalSettingsRecord> {
        await ensureAccessControlCatalogs(dbClient);

        const row = await getExaminationGlobalSettingsData(dbClient, EXAMINATION_SETTINGS_KEY);

        return {
            category: 'examination',
            key: EXAMINATION_SETTINGS_KEY,
            description:
                row?.description ||
                'Support-managed default examination configuration applied as a global baseline.',
            value: await resolveExaminationGlobalSettings(dbClient),
            updatedAt: toNullableDate(row?.updated_at),
        };
    }

    static async updateExaminationSettings(
        dbClient: DbClient,
        payload: ExaminationGlobalSettings,
        updatedBy?: string | null,
    ) {
        await upsertExaminationGlobalSettingsData({
            dbClient,
            settingsKey: EXAMINATION_SETTINGS_KEY,
            payload,
            updatedBy,
        });

        return this.getExaminationSettings(dbClient);
    }
}
