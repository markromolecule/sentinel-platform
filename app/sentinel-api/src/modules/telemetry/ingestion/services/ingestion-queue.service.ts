import { type DbClient } from '@sentinel/db';
import { Queue } from 'bullmq';
import { closeRedisConnection, createRedisConnection } from '../../../../lib/redis/redis.service';
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

export class TelemetryIngestionQueueService {
    private queue: Queue<PersistableProctoringEvent> | null = null;
    private queueConnection: ReturnType<typeof createRedisConnection> | null = null;

    getMode(): TelemetryQueueMode {
        return getTelemetryIngestionMode();
    }

    async getStats() {
        const mode = this.getMode();
        const stats: {
            mode: TelemetryQueueMode;
            queueName: string | null;
            bufferName: string | null;
            waiting?: number;
            active?: number;
            failed?: number;
            completed?: number;
            buffered?: number;
        } = {
            mode,
            queueName: mode === 'redis' ? getTelemetryQueueName() : null,
            bufferName: mode === 'redis' ? getTelemetryBufferName() : null,
        };

        if (mode === 'redis') {
            const queue = this.getQueue();
            const connection = this.getRedisConnection();
            const [waiting, active, failed, completed, buffered] = await Promise.all([
                queue.getWaitingCount(),
                queue.getActiveCount(),
                queue.getFailedCount(),
                queue.getCompletedCount(),
                connection.llen(getTelemetryBufferName()),
            ]);

            stats.waiting = waiting;
            stats.active = active;
            stats.failed = failed;
            stats.completed = completed;
            stats.buffered = buffered;
        }

        return stats;
    }

    async submit(db: DbClient, payload: PersistableProctoringEvent): Promise<void> {
        if (this.getMode() === 'sync') {
            await TelemetryStorageService.appendEvent(db, payload);
            return;
        }

        await this.getQueue().add(getTelemetryJobName(), payload);
    }

    /**
     * Buffers a batch of events into a Redis list for efficient bulk ingestion.
     */
    async bufferBatch(db: DbClient, events: PersistableProctoringEvent[]): Promise<void> {
        if (this.getMode() === 'sync') {
            await TelemetryStorageService.appendBatch(db, events);
            return;
        }

        const bufferName = getTelemetryBufferName();
        const connection = this.getRedisConnection();
        const jsonEvents = events.map((event) => JSON.stringify(event));

        // Use rpush to add events to the end of the buffer list
        await connection.rpush(bufferName, ...jsonEvents);
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
        const connection = this.getRedisConnection();

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
            console.error('[TelemetryQueue] Buffer flush failed, attempting to restore snapshot', error);
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

    private getQueue(): Queue<PersistableProctoringEvent> {
        if (!this.queue) {
            this.queue = new Queue<PersistableProctoringEvent>(getTelemetryQueueName(), {
                connection: this.getRedisConnection(),
                defaultJobOptions: getTelemetryJobOptions(),
            });
        }

        return this.queue;
    }

    private getRedisConnection(): ReturnType<typeof createRedisConnection> {
        if (!this.queueConnection) {
            this.queueConnection = createRedisConnection('producer');
        }

        return this.queueConnection;
    }
}

export const telemetryIngestionQueueService = new TelemetryIngestionQueueService();
