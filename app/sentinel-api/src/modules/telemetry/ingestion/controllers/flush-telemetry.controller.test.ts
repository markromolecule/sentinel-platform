import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { flushTelemetryRoute, flushTelemetryRouteHandler } from './flush-telemetry.controller';
import { telemetryIngestionQueueService } from '../services/ingestion-queue.service';

vi.mock('../services/ingestion-queue.service', () => ({
    telemetryIngestionQueueService: {
        flushBuffer: vi.fn(),
    },
}));

describe('Flush Telemetry Controller', () => {
    const app = new OpenAPIHono();
    app.openapi(flushTelemetryRoute, flushTelemetryRouteHandler);

    beforeEach(() => {
        vi.restoreAllMocks();
        // Reset env variables
        delete process.env.TELEMETRY_CRON_SECRET;
        delete process.env.CRON_SECRET;
    });

    it('successfully flushes buffer when authorized with TELEMETRY_CRON_SECRET', async () => {
        process.env.TELEMETRY_CRON_SECRET = 'test-secret';
        vi.spyOn(telemetryIngestionQueueService, 'flushBuffer').mockResolvedValue(5);

        const res = await app.request('/internal/flush', {
            headers: {
                Authorization: 'Bearer test-secret',
            },
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.flushedCount).toBe(5);
        expect(telemetryIngestionQueueService.flushBuffer).toHaveBeenCalled();
    });

    it('successfully flushes buffer when authorized with CRON_SECRET fallback', async () => {
        process.env.CRON_SECRET = 'vercel-secret';
        vi.spyOn(telemetryIngestionQueueService, 'flushBuffer').mockResolvedValue(10);

        const res = await app.request('/internal/flush', {
            headers: {
                Authorization: 'Bearer vercel-secret',
            },
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.flushedCount).toBe(10);
    });

    it('returns 401 when the secret does not match', async () => {
        process.env.TELEMETRY_CRON_SECRET = 'correct-secret';

        const res = await app.request('/internal/flush', {
            headers: {
                Authorization: 'Bearer wrong-secret',
            },
        });

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toContain('Unauthorized cron access');
    });

    it('returns 401 when Authorization header is missing but secret is required', async () => {
        process.env.TELEMETRY_CRON_SECRET = 'some-secret';

        const res = await app.request('/internal/flush');

        expect(res.status).toBe(401);
    });

    it('allows flush when no secret is configured (with a warning)', async () => {
        // No env secrets set
        vi.spyOn(telemetryIngestionQueueService, 'flushBuffer').mockResolvedValue(0);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const res = await app.request('/internal/flush');

        expect(res.status).toBe(200);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No cron secret configured'));
    });
});
