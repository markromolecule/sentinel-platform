import { type DbClient } from '@sentinel/db';
import { Queue } from 'bullmq';
import type { TelemetryOperationsSettings } from '@sentinel/shared/types';
import {
    closeRedisConnection,
    createRedisConnection,
    hasRedisConfigured,
    validateRedisConfig,
} from '../../../../lib/redis/redis.service';
import type { PersistableProctoringEvent } from '../ingestion.dto';
import { TelemetryStorageService } from '../../storage/storage.service';
import {
    getTelemetryBufferName,
    getTelemetryIngestionMode,
    getTelemetryJobName,
    getTelemetryJobOptions,
    getTelemetryQueueName,
    type TelemetryQueueMode,
} from '../config/ingestion-queue.config';

type TelemetryQueueRuntimeOptions = {
    operations?: TelemetryOperationsSettings;
    useBatchDelay?: boolean;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class TelemetryIngestionQueueService {
    private queue: Queue<PersistableProctoringEvent> | null = null;
    private queueConnection: ReturnType<typeof createRedisConnection> | null = null;

    /**
     * Resolves the effective ingestion mode, falling back to sync whenever
     * Redis-backed ingestion is requested without a configured Redis URL.
     */
    getMode(options?: TelemetryQueueRuntimeOptions): TelemetryQueueMode {
        const configuredMode = options?.operations?.ingestionMode;

        if (!configuredMode) {
            return this.resolveRedisBackedMode(getTelemetryIngestionMode(), 'environment');
        }

        return this.resolveRedisBackedMode(configuredMode, 'settings');
    }

    async getStats(options?: TelemetryQueueRuntimeOptions) {
        const mode = this.getMode(options);
        const stats: {
            mode: TelemetryQueueMode;
            queueName: string | null;
            bufferName: string | null;
            waiting?: number;
            active?: number;
            failed?: number;
            completed?: number;
            delayed?: number;
            buffered?: number;
            workerCount?: number;
            oldestWaitingJobAgeMs?: number | null;
            oldestWaitingJobTimestamp?: number | null;
        } = {
            mode,
            queueName: mode === 'redis' ? getTelemetryQueueName() : null,
            bufferName: mode === 'redis' ? getTelemetryBufferName() : null,
        };

        if (mode === 'redis') {
            const [queue, connection] = await Promise.all([
                this.getQueue(),
                this.getRedisConnection(),
            ]);
            const [waiting, active, failed, completed, delayed, buffered, workerCount] =
                await Promise.all([
                    queue.getWaitingCount(),
                    queue.getActiveCount(),
                    queue.getFailedCount(),
                    queue.getCompletedCount(),
                    queue.getDelayedCount(),
                    connection.llen(getTelemetryBufferName()),
                    queue.getWorkersCount().catch((error: any) => {
                        console.info(
                            '[TelemetryQueue] Could not get workers count:',
                            error.message,
                        );
                        return -1;
                    }),
                ]);

            stats.waiting = waiting;
            stats.active = active;
            stats.failed = failed;
            stats.completed = completed;
            stats.delayed = delayed;
            stats.buffered = buffered;
            stats.workerCount = workerCount;

            let oldestWaitingJobAgeMs: number | null = null;
            let oldestWaitingJobTimestamp: number | null = null;

            try {
                const waitingJobs = await queue.getWaiting(0, 0);
                if (waitingJobs.length > 0 && waitingJobs[0]) {
                    oldestWaitingJobTimestamp = waitingJobs[0].timestamp;
                    oldestWaitingJobAgeMs = Date.now() - oldestWaitingJobTimestamp;
                }
            } catch (error: any) {
                console.warn(
                    '[TelemetryQueue] Failed to fetch oldest waiting job stats:',
                    error.message,
                );
            }

            stats.oldestWaitingJobAgeMs = oldestWaitingJobAgeMs;
            stats.oldestWaitingJobTimestamp = oldestWaitingJobTimestamp;
        }

        return stats;
    }

    async submit(
        db: DbClient,
        payload: PersistableProctoringEvent,
        options?: TelemetryQueueRuntimeOptions,
    ): Promise<{ mode: TelemetryQueueMode; jobId?: string }> {
        const mode = this.getMode(options);
        if (mode === 'sync') {
            await TelemetryStorageService.appendEvent(db, payload);
            return { mode };
        }

        const queue = await this.getQueue();
        const jobOptions = getTelemetryJobOptions();

        if (options?.useBatchDelay && options.operations?.batchWindowMs) {
            jobOptions.delay = options.operations.batchWindowMs;
        }

        const eventId = payload.metadata?.eventId;
        if (eventId && UUID_PATTERN.test(eventId)) {
            jobOptions.jobId = eventId;
        }

        const job = await queue.add(getTelemetryJobName(), payload, jobOptions);
        const jobId = job.id;

        console.log('[TelemetryQueue] Event enqueued successfully', {
            mode,
            jobId,
            attemptId: payload.examSessionId,
            eventId: payload.metadata?.eventId ?? null,
            eventType: payload.eventType,
            dedupeKey: payload.metadata?.dedupeKey ?? null,
        });

        return { mode, jobId };
    }

    /**
     * Buffers a batch of events into a Redis list for efficient bulk ingestion.
     */
    async bufferBatch(
        db: DbClient,
        events: PersistableProctoringEvent[],
        options?: TelemetryQueueRuntimeOptions,
    ): Promise<void> {
        const mode = this.getMode(options);

        if (events.length === 0) {
            return;
        }

        const maxBatchSize = options?.operations?.maxBatchSize ?? events.length;
        const batches = this.chunkEvents(events, maxBatchSize);

        if (options?.operations && !options.operations.batchingEnabled) {
            for (const event of events) {
                await this.submit(db, event, {
                    operations: options.operations,
                    useBatchDelay: true,
                });
            }
            return;
        }

        if (mode === 'sync') {
            for (const batch of batches) {
                await TelemetryStorageService.appendBatch(db, batch);
            }
            return;
        }

        const bufferName = getTelemetryBufferName();
        const connection = await this.getRedisConnection();

        for (const batch of batches) {
            const jsonEvents = batch.map((event) => JSON.stringify(event));

            // Use rpush to add events to the end of the buffer list
            await connection.rpush(bufferName, ...jsonEvents);
        }
    }

    /**
     * Flushes the current Redis buffer into the database using a bulk insert.
     * Uses a snapshot pattern (RENAME) for atomic and safe processing.
     */
    async flushBuffer(db: DbClient): Promise<number> {
        if (this.getMode() !== 'redis') {
            return 0;
        }

        const bufferName = getTelemetryBufferName();
        const snapshotName = `${bufferName}:snapshot:${Date.now()}`;
        const connection = await this.getRedisConnection();

        // check if any items exist in the buffer
        const count = await connection.llen(bufferName);
        if (count === 0) {
            return 0;
        }

        // Atomic snapshot by renaming the list
        await connection.rename(bufferName, snapshotName);

        try {
            // Retrieve all events from the snapshot
            const jsonEvents = await connection.lrange(snapshotName, 0, -1);
            const events = jsonEvents.map((json) => JSON.parse(json) as PersistableProctoringEvent);

            if (events.length > 0) {
                // Bulk insert into the database
                await TelemetryStorageService.appendBatch(db, events);
            }

            // Cleanup snapshot upon successful write
            await connection.del(snapshotName);
            return events.length;
        } catch (error) {
            console.error(
                '[TelemetryQueue] Buffer flush failed, attempting to restore snapshot',
                error,
            );
            // In case of failure, we could potentially push back to the buffer,
            // but for simplicity we'll just log and let the snapshot persist for manual recovery if needed.
            throw error;
        }
    }

    async waitForIdle(): Promise<void> {
        if (this.getMode() !== 'redis' || !this.queue) {
            return;
        }

        await this.queue.waitUntilReady();
    }

    async close(): Promise<void> {
        if (this.queue) {
            await this.queue.close();
            this.queue = null;
        }

        await closeRedisConnection(this.queueConnection);
        this.queueConnection = null;
    }

    resetForTests(): void {
        this.queue = null;
        this.queueConnection = null;
    }

    private async getQueue(): Promise<Queue<PersistableProctoringEvent>> {
        if (!this.queue) {
            const connection = await this.getRedisConnection();
            this.queue = new Queue<PersistableProctoringEvent>(getTelemetryQueueName(), {
                connection,
                defaultJobOptions: getTelemetryJobOptions(),
            });
        }

        return this.queue;
    }

    private async getRedisConnection(): Promise<ReturnType<typeof createRedisConnection>> {
        if (!this.queueConnection) {
            this.queueConnection = createRedisConnection('producer');
            await validateRedisConfig(this.queueConnection);
        }

        return this.queueConnection;
    }

    private chunkEvents(
        events: PersistableProctoringEvent[],
        maxBatchSize: number,
    ): PersistableProctoringEvent[][] {
        if (maxBatchSize <= 0 || events.length <= maxBatchSize) {
            return [events];
        }

        const chunks: PersistableProctoringEvent[][] = [];

        for (let index = 0; index < events.length; index += maxBatchSize) {
            chunks.push(events.slice(index, index + maxBatchSize));
        }

        return chunks;
    }

    private resolveRedisBackedMode(
        configuredMode: string | null | undefined,
        source: 'environment' | 'settings',
    ): TelemetryQueueMode {
        if (configuredMode !== 'redis') {
            return 'sync';
        }

        if (hasRedisConfigured()) {
            return 'redis';
        }

        const sourceLabel =
            source === 'settings'
                ? 'Telemetry settings requested redis mode'
                : 'TELEMETRY_INGESTION_MODE requested redis mode';

        console.warn(
            `[TelemetryQueue] ${sourceLabel}, but REDIS_URL is not configured. Falling back to sync mode.`,
        );

        return 'sync';
    }
}

export const telemetryIngestionQueueService = new TelemetryIngestionQueueService();
