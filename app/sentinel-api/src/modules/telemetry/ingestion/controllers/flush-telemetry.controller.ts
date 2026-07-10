import { createRoute, z } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { telemetryIngestionQueueService } from '../services/ingestion-queue.service';

export const flushTelemetryRoute = createRoute({
    method: 'get',
    path: '/internal/flush',
    tags: ['Telemetry'],
    summary: 'Flush Telemetry Buffer',
    description:
        'Internal endpoint triggered by cron job to move buffered telemetry from Redis to Postgres.',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        flushedCount: z.number(),
                        stats: z.object({
                            mode: z.string(),
                            queueName: z.string().nullable(),
                            bufferName: z.string().nullable(),
                            waiting: z.number().optional(),
                            active: z.number().optional(),
                            failed: z.number().optional(),
                            completed: z.number().optional(),
                            buffered: z.number().optional(),
                        }),
                    }),
                },
            },
            description: 'Flush completed successfully',
        },
        401: {
            description: 'Unauthorized - invalid or missing cron secret',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const flushTelemetryRouteHandler: AppRouteHandler<typeof flushTelemetryRoute> = async (
    c,
) => {
    try {
        // Simple security check for cron trigger
        const authHeader = c.req.header('Authorization');
        // Support both custom telemetry secret and Vercel's built-in CRON_SECRET
        const cronSecret = process.env.TELEMETRY_CRON_SECRET || process.env.CRON_SECRET;

        // If a secret is configured, require it.
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            throw new HTTPException(401, { message: 'Unauthorized cron access.' });
        }

        if (!cronSecret) {
            console.warn(
                '[TelemetryFlush] Warning: No cron secret configured (TELEMETRY_CRON_SECRET or CRON_SECRET).',
            );
        }

        const flushedCount = await telemetryIngestionQueueService.flushBuffer(c.get('dbClient'));
        const stats = await telemetryIngestionQueueService.getStats();

        return c.json(
            {
                message: 'Telemetry flush completed.',
                flushedCount,
                stats,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Flush Telemetry Error:');
    }
};
