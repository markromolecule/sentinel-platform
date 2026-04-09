import { type DbClient } from '@sentinel/db';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type {
    ExaminationGlobalSettings,
    ExaminationGlobalSettingsRecord,
} from '@sentinel/shared/types';
import { getExaminationGlobalSettingsData } from '../data/get-examination-global-settings';
import { upsertExaminationGlobalSettingsData } from '../data/upsert-examination-global-settings';
import { ensureAccessControlCatalogs } from './access-control-catalog.service';
import { EXAMINATION_SETTINGS_KEY } from './access-control-overview.service';

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
            value: (row?.setting_value as ExaminationGlobalSettings) || {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
            },
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
