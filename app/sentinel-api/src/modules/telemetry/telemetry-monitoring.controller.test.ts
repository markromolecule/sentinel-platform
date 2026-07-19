import { OpenAPIHono } from '@hono/zod-openapi';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    telemetryHealthRoute,
    telemetryHealthRouteHandler,
} from './telemetry-monitoring.controller';
import { telemetryIngestionQueueService } from './ingestion/services/ingestion-queue.service';
import { telemetrySettingsResolverService } from './settings/telemetry-settings-resolver.service';

vi.mock('./ingestion/services/ingestion-queue.service', () => ({
    telemetryIngestionQueueService: {
        getStats: vi.fn(),
    },
}));

vi.mock('./settings/telemetry-settings-resolver.service', () => ({
    telemetrySettingsResolverService: {
        resolve: vi.fn(),
    },
}));

describe('telemetry monitoring controller', () => {
    const app = new OpenAPIHono();
    app.openapi(telemetryHealthRoute, telemetryHealthRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(telemetrySettingsResolverService.resolve).mockResolvedValue({
            updatedAt: null,
            value: {
                operations: undefined,
            },
        } as never);
    });

    it('exposes queue and buffer stats in the health payload', async () => {
        vi.mocked(telemetryIngestionQueueService.getStats).mockResolvedValue({
            mode: 'redis',
            queueName: 'telemetry-ingestion',
            bufferName: 'telemetry-buffer',
            waiting: 4,
            active: 2,
            failed: 1,
            completed: 9,
            buffered: 7,
        } as never);

        const response = await app.request('/health');

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toMatchObject({
            status: 'ok',
            ingestion: {
                mode: 'redis',
                queueName: 'telemetry-ingestion',
                bufferName: 'telemetry-buffer',
                waiting: 4,
                active: 2,
                failed: 1,
                completed: 9,
                buffered: 7,
            },
        });
        expect(telemetrySettingsResolverService.resolve).toHaveBeenCalledOnce();
        expect(telemetryIngestionQueueService.getStats).toHaveBeenCalledOnce();
    });
});
