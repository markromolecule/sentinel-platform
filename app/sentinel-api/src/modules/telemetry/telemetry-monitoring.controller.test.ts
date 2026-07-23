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

    it('exposes queue and buffer stats in the health payload and reports healthy when workers exist', async () => {
        vi.mocked(telemetryIngestionQueueService.getStats).mockResolvedValue({
            mode: 'redis',
            queueName: 'telemetry-ingestion',
            bufferName: 'telemetry-buffer',
            waiting: 4,
            active: 2,
            failed: 1,
            completed: 9,
            delayed: 0,
            buffered: 7,
            workerCount: 2,
            oldestWaitingJobAgeMs: 5000,
            oldestWaitingJobTimestamp: Date.now() - 5000,
        } as never);

        const response = await app.request('/health');

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toMatchObject({
            status: 'healthy',
            reasons: [],
            ingestion: {
                mode: 'redis',
                queueName: 'telemetry-ingestion',
                bufferName: 'telemetry-buffer',
                waiting: 4,
                active: 2,
                failed: 1,
                completed: 9,
                delayed: 0,
                buffered: 7,
                workerCount: 2,
                oldestWaitingJobAgeMs: 5000,
            },
        });
        expect(telemetrySettingsResolverService.resolve).toHaveBeenCalledOnce();
        expect(telemetryIngestionQueueService.getStats).toHaveBeenCalledOnce();
    });

    it('reports sync mode as healthy without requiring workers', async () => {
        vi.mocked(telemetryIngestionQueueService.getStats).mockResolvedValue({
            mode: 'sync',
            queueName: null,
            bufferName: null,
        } as never);

        const response = await app.request('/health');

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toMatchObject({
            status: 'healthy',
            reasons: [],
            ingestion: {
                mode: 'sync',
                queueName: null,
                bufferName: null,
            },
        });
    });

    it('reports degraded when worker count is zero', async () => {
        vi.mocked(telemetryIngestionQueueService.getStats).mockResolvedValue({
            mode: 'redis',
            queueName: 'telemetry-ingestion',
            bufferName: 'telemetry-buffer',
            waiting: 4,
            active: 2,
            failed: 1,
            completed: 9,
            delayed: 0,
            buffered: 7,
            workerCount: 0,
            oldestWaitingJobAgeMs: null,
            oldestWaitingJobTimestamp: null,
        } as never);

        const response = await app.request('/health');

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toMatchObject({
            status: 'degraded',
            reasons: ['NO_WORKERS'],
        });
    });

    it('reports degraded when worker count cannot be read', async () => {
        vi.mocked(telemetryIngestionQueueService.getStats).mockResolvedValue({
            mode: 'redis',
            queueName: 'telemetry-ingestion',
            bufferName: 'telemetry-buffer',
            waiting: 0,
            active: 0,
            failed: 0,
            completed: 9,
            delayed: 0,
            buffered: 0,
            workerCount: -1,
            oldestWaitingJobAgeMs: null,
            oldestWaitingJobTimestamp: null,
        } as never);

        const response = await app.request('/health');

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toMatchObject({
            status: 'degraded',
            reasons: ['WORKER_COUNT_UNAVAILABLE'],
        });
    });

    it('reports degraded when backlog is stale', async () => {
        vi.mocked(telemetryIngestionQueueService.getStats).mockResolvedValue({
            mode: 'redis',
            queueName: 'telemetry-ingestion',
            bufferName: 'telemetry-buffer',
            waiting: 4,
            active: 2,
            failed: 1,
            completed: 9,
            delayed: 0,
            buffered: 7,
            workerCount: 1,
            oldestWaitingJobAgeMs: 75000,
            oldestWaitingJobTimestamp: Date.now() - 75000,
        } as never);

        const response = await app.request('/health');

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toMatchObject({
            status: 'degraded',
            reasons: ['BACKLOG_STALE'],
        });
    });
});
