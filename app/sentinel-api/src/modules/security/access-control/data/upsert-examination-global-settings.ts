import { type DbClient } from '@sentinel/db';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

export async function upsertExaminationGlobalSettingsData(args: {
    dbClient: DbClient;
    settingsKey: string;
    payload: ExaminationGlobalSettings;
    updatedBy?: string | null;
}) {
    const { dbClient, settingsKey, payload, updatedBy } = args;

    await dbClient
        .insertInto('system_settings')
        .values({
            category: 'examination',
            setting_key: settingsKey,
            setting_value: payload as any,
            description:
                'Support-managed default examination configuration applied as a global baseline.',
            updated_at: new Date(),
            updated_by: updatedBy || null,
        })
        .onConflict((oc) =>
            oc.column('setting_key').doUpdateSet({
                category: 'examination',
                setting_value: payload as any,
                description:
                    'Support-managed default examination configuration applied as a global baseline.',
                updated_at: new Date(),
                updated_by: updatedBy || null,
            }),
        )
        .execute();
}
