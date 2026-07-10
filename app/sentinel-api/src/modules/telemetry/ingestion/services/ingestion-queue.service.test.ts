import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelemetryIngestionQueueService } from './ingestion-queue.service';
import { TelemetryStorageService } from '../../storage/storage.service';

const { mockQueueAdd, MockQueue, mockHasRedisConfigured, mockValidateRedisConfig } = vi.hoisted(
    () => ({
        mockQueueAdd: vi.fn(),
        mockHasRedisConfigured: vi.fn(() => Boolean(process.env.REDIS_URL)),
        mockValidateRedisConfig: vi.fn().mockResolvedValue(undefined),
        MockQueue: vi.fn(function MockQueue() {
            return {
                add: mockQueueAdd,
                close: vi.fn().mockResolvedValue(undefined),
                waitUntilReady: vi.fn().mockResolvedValue(undefined),
                getWaitingCount: vi.fn().mockResolvedValue(0),
                getActiveCount: vi.fn().mockResolvedValue(0),
                getFailedCount: vi.fn().mockResolvedValue(0),
                getCompletedCount: vi.fn().mockResolvedValue(0),
            };
        }),
    }),
);

vi.mock('bullmq', () => ({
    Queue: MockQueue,
}));

vi.mock('../../../../lib/redis/redis.service', () => ({
    createRedisConnection: vi.fn(() => ({
        llen: vi.fn().mockResolvedValue(0),
        quit: vi.fn().mockResolvedValue('OK'),
        disconnect: vi.fn(),
    })),
    closeRedisConnection: vi.fn().mockResolvedValue(undefined),
    hasRedisConfigured: mockHasRedisConfigured,
    validateRedisConfig: mockValidateRedisConfig,
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
        mockQueueAdd.mockReset();
        mockHasRedisConfigured.mockClear();
        mockValidateRedisConfig.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
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
        expect(mockQueueAdd).not.toHaveBeenCalled();
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
        expect(mockQueueAdd).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith(
            '[TelemetryQueue] Telemetry settings requested redis mode, but REDIS_URL is not configured. Falling back to sync mode.',
        );
    });
});
