import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelemetryIngestionQueueService } from './ingestion-queue.service';
import { TelemetryStorageService } from '../../storage/storage.service';

const hoisted = vi.hoisted(() => {
    const mockQueueAdd = vi.fn().mockResolvedValue({ id: 'mock-job-id' });
    const mockQueueClose = vi.fn().mockResolvedValue(undefined);
    const mockQueueWaitUntilReady = vi.fn().mockResolvedValue(undefined);
    const mockQueueGetWaitingCount = vi.fn().mockResolvedValue(0);
    const mockQueueGetActiveCount = vi.fn().mockResolvedValue(0);
    const mockQueueGetFailedCount = vi.fn().mockResolvedValue(0);
    const mockQueueGetCompletedCount = vi.fn().mockResolvedValue(0);
    const mockQueueGetDelayedCount = vi.fn().mockResolvedValue(0);
    const mockQueueGetWorkersCount = vi.fn().mockResolvedValue(0);
    const mockQueueGetWaiting = vi.fn().mockResolvedValue([]);
    const mockHasRedisConfigured = vi.fn(() => Boolean(process.env.REDIS_URL));
    const mockValidateRedisConfig = vi.fn().mockResolvedValue(undefined);
    const mockCreateRedisConnection = vi.fn();
    const mockRedisConnection = {
        llen: vi.fn().mockResolvedValue(0),
        rpush: vi.fn().mockResolvedValue(0),
        rename: vi.fn().mockResolvedValue('OK'),
        lrange: vi.fn().mockResolvedValue([]),
        del: vi.fn().mockResolvedValue(0),
        quit: vi.fn().mockResolvedValue('OK'),
        disconnect: vi.fn(),
    };
    const MockQueue = vi.fn(function MockQueue() {
        return {
            add: mockQueueAdd,
            close: mockQueueClose,
            waitUntilReady: mockQueueWaitUntilReady,
            getWaitingCount: mockQueueGetWaitingCount,
            getActiveCount: mockQueueGetActiveCount,
            getFailedCount: mockQueueGetFailedCount,
            getCompletedCount: mockQueueGetCompletedCount,
            getDelayedCount: mockQueueGetDelayedCount,
            getWorkersCount: mockQueueGetWorkersCount,
            getWaiting: mockQueueGetWaiting,
        };
    });

    mockCreateRedisConnection.mockReturnValue(mockRedisConnection);

    return {
        MockQueue,
        mockCreateRedisConnection,
        mockHasRedisConfigured,
        mockQueueAdd,
        mockQueueClose,
        mockQueueGetActiveCount,
        mockQueueGetCompletedCount,
        mockQueueGetFailedCount,
        mockQueueGetWaitingCount,
        mockQueueGetDelayedCount,
        mockQueueGetWorkersCount,
        mockQueueGetWaiting,
        mockQueueWaitUntilReady,
        mockRedisConnection,
        mockValidateRedisConfig,
    };
});

vi.mock('bullmq', () => ({
    Queue: hoisted.MockQueue,
}));

vi.mock('../../../../lib/redis/redis.service', () => ({
    createRedisConnection: hoisted.mockCreateRedisConnection,
    closeRedisConnection: vi.fn().mockResolvedValue(undefined),
    hasRedisConfigured: hoisted.mockHasRedisConfigured,
    validateRedisConfig: hoisted.mockValidateRedisConfig,
}));

describe('TelemetryIngestionQueueService', () => {
    const dbClient = {} as any;
    const payload = {
        examSessionId: 'attempt-1',
        studentId: 'student-1',
        timestamp: '2099-06-24T08:00:00.000Z',
        eventType: 'TAB_SWITCH',
        platform: 'WEB',
        source: 'CLIENT',
        ruleKey: 'webSecurity.tab_switching_monitor',
        metadata: {
            aggregation: {
                trigger: 'immediate',
            },
        },
    } as any;

    beforeEach(() => {
        delete process.env.TELEMETRY_INGESTION_MODE;
        delete process.env.REDIS_URL;
        delete process.env.TELEMETRY_REDIS_QUEUE_NAME;
        delete process.env.TELEMETRY_REDIS_BUFFER_NAME;

        hoisted.mockQueueAdd.mockReset();
        hoisted.mockQueueClose.mockClear();
        hoisted.mockQueueGetWaitingCount.mockReset();
        hoisted.mockQueueGetActiveCount.mockReset();
        hoisted.mockQueueGetFailedCount.mockReset();
        hoisted.mockQueueGetCompletedCount.mockReset();
        hoisted.mockQueueGetDelayedCount.mockReset();
        hoisted.mockQueueGetWorkersCount.mockReset();
        hoisted.mockQueueGetWaiting.mockReset();
        hoisted.mockQueueWaitUntilReady.mockClear();
        hoisted.mockHasRedisConfigured.mockClear();
        hoisted.mockValidateRedisConfig.mockClear();
        hoisted.mockCreateRedisConnection.mockClear();

        hoisted.mockQueueAdd.mockResolvedValue({ id: 'mock-job-id' });
        hoisted.mockQueueGetWaitingCount.mockResolvedValue(0);
        hoisted.mockQueueGetActiveCount.mockResolvedValue(0);
        hoisted.mockQueueGetFailedCount.mockResolvedValue(0);
        hoisted.mockQueueGetCompletedCount.mockResolvedValue(0);
        hoisted.mockQueueGetDelayedCount.mockResolvedValue(0);
        hoisted.mockQueueGetWorkersCount.mockResolvedValue(0);
        hoisted.mockQueueGetWaiting.mockResolvedValue([]);

        hoisted.mockRedisConnection.llen.mockReset();
        hoisted.mockRedisConnection.rpush.mockReset();
        hoisted.mockRedisConnection.rename.mockReset();
        hoisted.mockRedisConnection.lrange.mockReset();
        hoisted.mockRedisConnection.del.mockReset();
        hoisted.mockRedisConnection.quit.mockReset();
        hoisted.mockRedisConnection.disconnect.mockReset();

        hoisted.mockRedisConnection.llen.mockResolvedValue(0);
        hoisted.mockRedisConnection.rpush.mockResolvedValue(0);
        hoisted.mockRedisConnection.rename.mockResolvedValue('OK');
        hoisted.mockRedisConnection.lrange.mockResolvedValue([]);
        hoisted.mockRedisConnection.del.mockResolvedValue(0);
        hoisted.mockRedisConnection.quit.mockResolvedValue('OK');

        hoisted.mockCreateRedisConnection.mockReturnValue(hoisted.mockRedisConnection);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('persists events synchronously when redis ingestion is not enabled', async () => {
        const queueService = new TelemetryIngestionQueueService();
        const appendSpy = vi
            .spyOn(TelemetryStorageService, 'appendEvent')
            .mockResolvedValue(undefined);

        await queueService.submit(dbClient, payload);

        expect(queueService.getMode()).toBe('sync');
        expect(appendSpy).toHaveBeenCalledOnce();
        expect(appendSpy).toHaveBeenCalledWith(dbClient, payload);
        expect(hoisted.mockQueueAdd).not.toHaveBeenCalled();
    });

    it('enqueues telemetry events in redis mode', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        const queueService = new TelemetryIngestionQueueService();

        await queueService.submit(dbClient, payload);

        expect(queueService.getMode()).toBe('redis');
        expect(hoisted.mockCreateRedisConnection).toHaveBeenCalledWith('producer');
        expect(hoisted.mockValidateRedisConfig).toHaveBeenCalledOnce();
        expect(hoisted.mockQueueAdd).toHaveBeenCalledOnce();
        expect(hoisted.mockQueueAdd).toHaveBeenCalledWith(
            'append-proctoring-event',
            payload,
            expect.objectContaining({
                attempts: 3,
                removeOnComplete: { count: 1000 },
                removeOnFail: { count: 5000 },
            }),
        );
    });

    it('uses a valid event UUID as the redis job id', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        const queueService = new TelemetryIngestionQueueService();
        const eventId = '123e4567-e89b-42d3-a456-426614174999';

        await queueService.submit(dbClient, {
            ...payload,
            metadata: {
                ...payload.metadata,
                eventId,
            },
        });

        expect(hoisted.mockQueueAdd).toHaveBeenCalledWith(
            'append-proctoring-event',
            expect.anything(),
            expect.objectContaining({
                jobId: eventId,
            }),
        );
    });

    it('does not use malformed event ids as redis job ids', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        const queueService = new TelemetryIngestionQueueService();

        await queueService.submit(dbClient, {
            ...payload,
            metadata: {
                ...payload.metadata,
                eventId: 'not-a-uuid',
            },
        });

        expect(hoisted.mockQueueAdd).toHaveBeenCalledWith(
            'append-proctoring-event',
            expect.anything(),
            expect.not.objectContaining({
                jobId: expect.any(String),
            }),
        );
    });

    it('falls back to sync mode when redis is requested by environment but REDIS_URL is missing', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        const queueService = new TelemetryIngestionQueueService();
        const appendSpy = vi
            .spyOn(TelemetryStorageService, 'appendEvent')
            .mockResolvedValue(undefined);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(queueService.getMode()).toBe('sync');

        await queueService.submit(dbClient, payload);

        expect(appendSpy).toHaveBeenCalledOnce();
        expect(hoisted.mockQueueAdd).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith(
            '[TelemetryQueue] TELEMETRY_INGESTION_MODE requested redis mode, but REDIS_URL is not configured. Falling back to sync mode.',
        );
    });

    it('falls back to sync mode when redis is requested by settings but REDIS_URL is missing', async () => {
        const queueService = new TelemetryIngestionQueueService();
        const appendSpy = vi
            .spyOn(TelemetryStorageService, 'appendEvent')
            .mockResolvedValue(undefined);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(queueService.getMode({ operations: { ingestionMode: 'redis' } as any })).toBe(
            'sync',
        );

        await queueService.submit(dbClient, payload, {
            operations: { ingestionMode: 'redis' } as any,
        });

        expect(appendSpy).toHaveBeenCalledOnce();
        expect(hoisted.mockQueueAdd).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith(
            '[TelemetryQueue] Telemetry settings requested redis mode, but REDIS_URL is not configured. Falling back to sync mode.',
        );
    });

    it('returns redis queue and buffer stats when redis mode is active', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        process.env.TELEMETRY_REDIS_QUEUE_NAME = 'telemetry-ingestion';
        process.env.TELEMETRY_REDIS_BUFFER_NAME = 'telemetry-buffer';
        const queueService = new TelemetryIngestionQueueService();

        hoisted.mockQueueGetWaitingCount.mockResolvedValue(4);
        hoisted.mockQueueGetActiveCount.mockResolvedValue(2);
        hoisted.mockQueueGetFailedCount.mockResolvedValue(1);
        hoisted.mockQueueGetCompletedCount.mockResolvedValue(9);
        hoisted.mockQueueGetDelayedCount.mockResolvedValue(3);
        hoisted.mockQueueGetWorkersCount.mockResolvedValue(2);
        hoisted.mockQueueGetWaiting.mockResolvedValue([{ timestamp: Date.now() - 5000 }]);
        hoisted.mockRedisConnection.llen.mockResolvedValue(7);

        await queueService.submit(dbClient, payload);
        const stats = await queueService.getStats();

        expect(stats).toMatchObject({
            mode: 'redis',
            queueName: 'telemetry-ingestion',
            bufferName: 'telemetry-buffer',
            waiting: 4,
            active: 2,
            failed: 1,
            completed: 9,
            delayed: 3,
            buffered: 7,
            workerCount: 2,
        });
        expect(stats.oldestWaitingJobAgeMs).toBeGreaterThanOrEqual(4999);
    });

    it('uses a bounded worker count fallback when redis cannot report workers', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        const queueService = new TelemetryIngestionQueueService();
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        hoisted.mockQueueGetWorkersCount.mockRejectedValue(new Error('unsupported'));

        const stats = await queueService.getStats();

        expect(stats.workerCount).toBe(-1);
        expect(infoSpy).toHaveBeenCalledWith(
            '[TelemetryQueue] Could not get workers count:',
            'unsupported',
        );
    });

    it('buffers telemetry batches into redis using the configured batch size', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        process.env.TELEMETRY_REDIS_BUFFER_NAME = 'telemetry-buffer';
        const queueService = new TelemetryIngestionQueueService();
        const events = [
            payload,
            { ...payload, eventType: 'COPY_ATTEMPT' },
            { ...payload, eventType: 'FULL_SCREEN_EXIT' },
        ];

        await queueService.bufferBatch(dbClient, events, {
            operations: {
                ingestionMode: 'redis',
                batchingEnabled: true,
                maxBatchSize: 2,
            } as any,
        });

        expect(hoisted.mockRedisConnection.rpush).toHaveBeenCalledTimes(2);
        expect(hoisted.mockRedisConnection.rpush).toHaveBeenNthCalledWith(
            1,
            'telemetry-buffer',
            JSON.stringify(events[0]),
            JSON.stringify(events[1]),
        );
        expect(hoisted.mockRedisConnection.rpush).toHaveBeenNthCalledWith(
            2,
            'telemetry-buffer',
            JSON.stringify(events[2]),
        );
    });

    it('flushes the redis snapshot into the database and clears the snapshot on success', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        process.env.TELEMETRY_REDIS_BUFFER_NAME = 'telemetry-buffer';
        const queueService = new TelemetryIngestionQueueService();
        const appendBatchSpy = vi
            .spyOn(TelemetryStorageService, 'appendBatch')
            .mockResolvedValue(undefined);
        const events = [payload, { ...payload, eventType: 'COPY_ATTEMPT' }];

        hoisted.mockRedisConnection.llen.mockResolvedValue(events.length);
        hoisted.mockRedisConnection.lrange.mockResolvedValue(
            events.map((event) => JSON.stringify(event)),
        );

        const flushedCount = await queueService.flushBuffer(dbClient);

        expect(flushedCount).toBe(2);
        expect(hoisted.mockRedisConnection.rename).toHaveBeenCalledOnce();
        expect(appendBatchSpy).toHaveBeenCalledWith(dbClient, events);
        expect(hoisted.mockRedisConnection.del).toHaveBeenCalledOnce();
    });

    it('preserves the snapshot for recovery when a flush fails after rename', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        process.env.TELEMETRY_REDIS_BUFFER_NAME = 'telemetry-buffer';
        const queueService = new TelemetryIngestionQueueService();
        const appendError = new Error('append failed');
        const appendBatchSpy = vi
            .spyOn(TelemetryStorageService, 'appendBatch')
            .mockRejectedValue(appendError);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        hoisted.mockRedisConnection.llen.mockResolvedValue(1);
        hoisted.mockRedisConnection.lrange.mockResolvedValue([JSON.stringify(payload)]);

        await expect(queueService.flushBuffer(dbClient)).rejects.toThrow('append failed');

        expect(hoisted.mockRedisConnection.rename).toHaveBeenCalledOnce();
        expect(appendBatchSpy).toHaveBeenCalledOnce();
        expect(hoisted.mockRedisConnection.del).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(
            '[TelemetryQueue] Buffer flush failed, attempting to restore snapshot',
            appendError,
        );
    });
});
