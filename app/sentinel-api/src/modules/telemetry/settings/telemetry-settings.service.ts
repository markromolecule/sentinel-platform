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
        console.info('[TelemetrySettings] Updating support-managed telemetry settings', {
            updatedBy: updatedBy ?? null,
            version: payload.version,
            telemetryEnabled: payload.operations.enabled,
            ingestionMode: payload.operations.ingestionMode,
            batchingEnabled: payload.operations.batchingEnabled,
            mediaPipeSandboxEnabled: payload.mediaPipeSandbox.enabled,
        });

        await upsertTelemetrySettingsData({
            dbClient,
            settingsKey: TELEMETRY_SETTINGS_KEY,
            payload,
            updatedBy,
        });

        telemetrySettingsResolverService.invalidate();

        const record = await this.getTelemetrySettings(dbClient);

        console.info('[TelemetrySettings] Updated support-managed telemetry settings', {
            key: record.key,
            updatedAt: record.updatedAt,
            updatedBy: record.updatedBy,
        });

        // Telemetry logging
        try {
            const { LogsService } = await import('../../general/logs/logs.service');
            let instId = '';
            if (updatedBy) {
                const userProfile = await dbClient
                    .selectFrom('user_profiles')
                    .select(['institution_id'])
                    .where('user_id', '=', updatedBy)
                    .executeTakeFirst();
                if (userProfile?.institution_id) {
                    instId = userProfile.institution_id;
                }
            }
            if (instId) {
                await LogsService.createLog(dbClient, {
                    userId: updatedBy ?? '00000000-0000-0000-0000-000000000000',
                    action: 'telemetry.settings_updated',
                    resourceType: 'system',
                    resourceId: record.key,
                    activeInstitutionId: instId,
                    details: {
                        version: payload.version,
                        telemetryEnabled: payload.operations.enabled,
                    },
                });
            }
        } catch (logErr) {
            console.error('Failed to log telemetry.settings_updated:', logErr);
        }

        return record;
    }
}
