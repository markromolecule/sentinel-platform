import 'dotenv/config';
import { dbClient } from '@sentinel/db';
import { Worker } from 'bullmq';
import {
    closeRedisConnection,
    createRedisConnection,
    validateRedisConfig,
} from '../../../../lib/redis/redis.service';
import type { PersistableProctoringEvent } from '../ingestion.dto';
import {
    getTelemetryIngestionMode,
    getTelemetryQueueName,
    getTelemetryWorkerConcurrency,
} from '../config/ingestion-queue.config';
import {
    buildTelemetryJobLogContext,
    processQueuedTelemetryEvent,
} from '../services/telemetry-job-processor.service';

export function getRedisConnectionTarget() {
    const redisUrl = process.env.REDIS_URL?.trim();

    if (!redisUrl) {
        return {
            host: 'unconfigured',
            port: 'unconfigured',
        };
    }

    try {
        const parsed = new URL(redisUrl);

        return {
            host: parsed.hostname || 'unknown',
            port: parsed.port || 'default',
        };
    } catch {
        return {
            host: 'invalid-url',
            port: 'invalid-url',
        };
    }
}

export const buildWorkerFailureContext = (
    payload: PersistableProctoringEvent | null | undefined,
    jobId: string | null,
) => {
    return {
        jobId,
        ...(payload ? buildTelemetryJobLogContext(payload) : {}),
    };
};

export const startWorker = async (): Promise<void> => {
    if (getTelemetryIngestionMode() !== 'redis') {
        console.log(
            `[TelemetryWorker] Ingestion mode is set to "${getTelemetryIngestionMode()}". Telemetry worker is inactive and exiting gracefully.`,
        );
        return;
    }

    const workerConnection = createRedisConnection('worker');
    const redisTarget = getRedisConnectionTarget();
    console.log('[TelemetryWorker] Validating Redis configuration...');
    await validateRedisConfig(workerConnection);

    const worker = new Worker<PersistableProctoringEvent>(
        getTelemetryQueueName(),
        async (job) => {
            const outcome = await processQueuedTelemetryEvent(dbClient, job.data);
            console.log('[TelemetryWorker] Job completed', {
                queueName: getTelemetryQueueName(),
                jobId: job.id,
                outcome,
                ...buildTelemetryJobLogContext(job.data),
            });
        },
        {
            connection: workerConnection,
            concurrency: getTelemetryWorkerConcurrency(),
        },
    );

    worker.on('ready', () => {
        console.log('[TelemetryWorker] Worker ready', {
            queueName: getTelemetryQueueName(),
            concurrency: getTelemetryWorkerConcurrency(),
            redisHost: redisTarget.host,
            redisPort: redisTarget.port,
        });
    });

    worker.on('failed', (job, error) => {
        console.error('[TelemetryWorker] Failed to process job', {
            queueName: getTelemetryQueueName(),
            error: error.message,
            ...buildWorkerFailureContext(job?.data, job?.id?.toString() ?? null),
        });
    });

    worker.on('error', (error) => {
        console.error('[TelemetryWorker] Worker connection or runtime error', {
            queueName: getTelemetryQueueName(),
            redisHost: redisTarget.host,
            redisPort: redisTarget.port,
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
        });
    });

    worker.on('stalled', async (jobId) => {
        const job = typeof jobId === 'string' ? await worker.getJob(jobId) : undefined;

        console.error('[TelemetryWorker] Job stalled', {
            queueName: getTelemetryQueueName(),
            redisHost: redisTarget.host,
            redisPort: redisTarget.port,
            ...buildWorkerFailureContext(
                (job?.data as PersistableProctoringEvent | undefined) ?? null,
                jobId?.toString?.() ?? null,
            ),
        });
    });

    const shutdown = async (signal: string): Promise<void> => {
        console.log(`Shutting down telemetry worker after ${signal}.`);
        await worker.close();
        await closeRedisConnection(workerConnection);
        process.exit(0);
    };

    process.on('SIGINT', () => {
        void shutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
        void shutdown('SIGTERM');
    });
};

void startWorker().catch((error) => {
    console.error('Telemetry worker startup failed:', error);
    process.exit(1);
});
