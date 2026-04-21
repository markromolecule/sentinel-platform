import type { DbClient } from '@sentinel/db';
import type { TelemetrySettings, TelemetrySettingsRecord } from '@sentinel/shared/types';
import { telemetrySettingsResolverService } from './telemetry-settings-resolver.service';
import { upsertTelemetrySettingsData } from './data/upsert-telemetry-settings';
import { TELEMETRY_SETTINGS_KEY } from './settings.constants';

export class TelemetrySettingsService {
    static async getTelemetrySettings(dbClient: DbClient): Promise<TelemetrySettingsRecord> {
        return telemetrySettingsResolverService.resolve(dbClient);
    }

    static async updateTelemetrySettings(
        dbClient: DbClient,
        payload: TelemetrySettings,
        updatedBy?: string | null,
    ): Promise<TelemetrySettingsRecord> {
        await upsertTelemetrySettingsData({
            dbClient,
            settingsKey: TELEMETRY_SETTINGS_KEY,
            payload,
            updatedBy,
        });

        telemetrySettingsResolverService.invalidate();

        return this.getTelemetrySettings(dbClient);
    }
}
