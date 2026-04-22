import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';
import type { DbClient } from '@sentinel/db';
import { TelemetrySettingsResolverService } from './telemetry-settings-resolver.service';
import { getTelemetrySettingsData } from './data/get-telemetry-settings';

vi.mock('./data/get-telemetry-settings', () => ({
    getTelemetrySettingsData: vi.fn(),
}));

describe('TelemetrySettingsResolverService', () => {
    const dbClient = {} as DbClient;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns a fresh default MediaPipe sandbox contract when no persisted settings row exists', async () => {
        vi.mocked(getTelemetrySettingsData).mockResolvedValue(null);

        const service = new TelemetrySettingsResolverService();
        const firstResolution = await service.resolve(dbClient);

        firstResolution.value.mediaPipeSandbox.enabled = true;
        firstResolution.value.mediaPipeSandbox.emitDuringExam = true;

        service.resetForTests();

        const secondResolution = await service.resolve(dbClient);

        expect(secondResolution.value.mediaPipeSandbox).toEqual(
            DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
        );
    });
});
