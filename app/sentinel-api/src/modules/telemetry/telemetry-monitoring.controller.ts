import { createRoute, z } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../types/hono';
import { telemetryIngestionQueueService } from './ingestion/services/ingestion-queue.service';
import { telemetrySettingsResolverService } from './settings/telemetry-settings-resolver.service';

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
                        status: z.enum(['healthy', 'degraded']),
                        reasons: z.array(z.string()),
                        timestamp: z.string(),
                        ingestion: z.object({
                            mode: z.string(),
                            queueName: z.string().nullable(),
                            bufferName: z.string().nullable(),
                            waiting: z.number().optional(),
                            active: z.number().optional(),
                            failed: z.number().optional(),
                            completed: z.number().optional(),
                            delayed: z.number().optional(),
                            buffered: z.number().optional(),
                            workerCount: z.number().optional(),
                            oldestWaitingJobAgeMs: z.number().nullable().optional(),
                            oldestWaitingJobTimestamp: z.number().nullable().optional(),
                        }),
                    }),
                },
            },
        },
    },
});

export const telemetryHealthRouteHandler: AppRouteHandler<typeof telemetryHealthRoute> = async (
    c,
) => {
    const db = c.get('dbClient');
    const resolvedSettingsRecord = await telemetrySettingsResolverService.resolve(db);
    const settingsRecord =
        resolvedSettingsRecord.updatedAt === null ? undefined : resolvedSettingsRecord;

    const stats = await telemetryIngestionQueueService.getStats({
        operations: settingsRecord?.value.operations,
    });

    let status: 'healthy' | 'degraded' = 'healthy';
    const reasons: string[] = [];

    if (stats.mode === 'redis') {
        const MAX_WAITING_JOB_AGE_MS = 60_000; // 60 seconds

        if (stats.workerCount === -1) {
            status = 'degraded';
            reasons.push('WORKER_COUNT_UNAVAILABLE');
        } else if (stats.workerCount === 0) {
            status = 'degraded';
            reasons.push('NO_WORKERS');
        }

        if (
            stats.oldestWaitingJobAgeMs !== undefined &&
            stats.oldestWaitingJobAgeMs !== null &&
            stats.oldestWaitingJobAgeMs > MAX_WAITING_JOB_AGE_MS
        ) {
            status = 'degraded';
            reasons.push('BACKLOG_STALE');
        }
    }

    return c.json({
        status,
        reasons,
        timestamp: new Date().toISOString(),
        ingestion: stats,
    });
};
