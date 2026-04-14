import { createRoute, z } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../types/hono';
import { telemetryIngestionQueueService } from './ingestion/services/ingestion-queue.service';

export const telemetryHealthRoute = createRoute({
    method: 'get',
    path: '/health',
    summary: 'Get telemetry system health and stats',
    tags: ['Telemetry'],
    responses: {
        200: {
            description: 'Telemetry system stats',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.string(),
                        timestamp: z.string(),
                        ingestion: z.object({
                            mode: z.string(),
                            queueName: z.string().nullable(),
                            waiting: z.number().optional(),
                            active: z.number().optional(),
                            failed: z.number().optional(),
                            completed: z.number().optional(),
                        }),
                    }),
                },
            },
        },
    },
});

export const telemetryHealthRouteHandler: AppRouteHandler<typeof telemetryHealthRoute> = async (c) => {
    const stats = await telemetryIngestionQueueService.getStats();

    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        ingestion: stats,
    });
};
