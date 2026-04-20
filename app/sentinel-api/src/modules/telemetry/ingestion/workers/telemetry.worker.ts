import 'dotenv/config';
import { dbClient } from '@sentinel/db';
import { Worker } from 'bullmq';
import {
    closeRedisConnection,
    createRedisConnection,
    validateRedisConfig,
} from '../../../../lib/redis/redis.service';
import type { PersistableProctoringEvent } from '../ingestion.dto';
import { TelemetryStorageService } from '../../storage/storage.service';
import {
    getTelemetryIngestionMode,
    getTelemetryQueueName,
    getTelemetryWorkerConcurrency,
} from '../config/ingestion-queue.config';

const startWorker = async (): Promise<void> => {
    if (getTelemetryIngestionMode() !== 'redis') {
        throw new Error('Telemetry worker requires TELEMETRY_INGESTION_MODE=redis before startup.');
    }

    const workerConnection = createRedisConnection('worker');
    console.log('[TelemetryWorker] Validating Redis configuration...');
    await validateRedisConfig(workerConnection);

    const worker = new Worker<PersistableProctoringEvent>(
        getTelemetryQueueName(),
        async (job) => {
            await TelemetryStorageService.appendEvent(dbClient, job.data);
        },
        {
            connection: workerConnection,
            concurrency: getTelemetryWorkerConcurrency(),
        },
    );

    worker.on('ready', () => {
        console.log(
            `Telemetry worker listening on queue "${getTelemetryQueueName()}" with concurrency ${getTelemetryWorkerConcurrency()}.`,
        );
    });

    worker.on('failed', (job, error) => {
        console.error('Telemetry worker failed to process job:', {
            jobId: job?.id ?? null,
            queue: getTelemetryQueueName(),
            error: error.message,
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
