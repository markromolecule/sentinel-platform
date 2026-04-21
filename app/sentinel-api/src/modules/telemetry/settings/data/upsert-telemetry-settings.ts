import { type DbClient } from '@sentinel/db';
import type { TelemetrySettings } from '@sentinel/shared/types';
import { TELEMETRY_SETTINGS_CATEGORY, TELEMETRY_SETTINGS_DESCRIPTION } from '../settings.constants';

export async function upsertTelemetrySettingsData(args: {
    dbClient: DbClient;
    settingsKey: string;
    payload: TelemetrySettings;
    updatedBy?: string | null;
}) {
    const { dbClient, settingsKey, payload, updatedBy } = args;

    await dbClient
        .insertInto('system_settings')
        .values({
            category: TELEMETRY_SETTINGS_CATEGORY,
            setting_key: settingsKey,
            setting_value: payload as any,
            description: TELEMETRY_SETTINGS_DESCRIPTION,
            updated_at: new Date(),
            updated_by: updatedBy || null,
        })
        .onConflict((oc) =>
            oc.column('setting_key').doUpdateSet({
                category: TELEMETRY_SETTINGS_CATEGORY,
                setting_value: payload as any,
                description: TELEMETRY_SETTINGS_DESCRIPTION,
                updated_at: new Date(),
                updated_by: updatedBy || null,
            }),
        )
        .execute();
}
