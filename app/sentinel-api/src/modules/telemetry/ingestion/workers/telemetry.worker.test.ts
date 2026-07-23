import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
    const handlers = new Map<string, (...args: any[]) => any>();
    const workerClose = vi.fn().mockResolvedValue(undefined);
    const WorkerMock = vi.fn(function Worker() {
        return {
            on: vi.fn((event: string, handler: (...args: any[]) => any) => {
                handlers.set(event, handler);
                return this;
            }),
            close: workerClose,
        };
    });

    return {
        WorkerMock,
        handlers,
        workerClose,
        createRedisConnection: vi.fn(() => ({ quit: vi.fn(), disconnect: vi.fn() })),
        closeRedisConnection: vi.fn().mockResolvedValue(undefined),
        hasRedisConfigured: vi.fn(() => Boolean(process.env.REDIS_URL)),
        validateRedisConfig: vi.fn().mockResolvedValue(undefined),
        processQueuedTelemetryEvent: vi.fn().mockResolvedValue('inserted'),
        resolveTelemetrySettings: vi.fn().mockResolvedValue({
            updatedAt: null,
            value: {
                operations: {
                    ingestionMode: 'sync',
                },
            },
        }),
    };
});

vi.mock('bullmq', () => ({
    Worker: hoisted.WorkerMock,
}));

vi.mock('../../../../lib/redis/redis.service', () => ({
    createRedisConnection: hoisted.createRedisConnection,
    closeRedisConnection: hoisted.closeRedisConnection,
    hasRedisConfigured: hoisted.hasRedisConfigured,
    validateRedisConfig: hoisted.validateRedisConfig,
}));

vi.mock('../services/telemetry-job-processor.service', () => ({
    buildTelemetryJobLogContext: (payload: any) => ({
        attemptId: payload.examSessionId,
        studentId: payload.studentId,
        eventType: payload.eventType,
        ruleKey: payload.ruleKey,
        timestamp: payload.timestamp,
        eventId: payload.metadata?.eventId ?? null,
        dedupeKey: payload.metadata?.dedupeKey ?? null,
    }),
    processQueuedTelemetryEvent: hoisted.processQueuedTelemetryEvent,
}));

vi.mock('../../settings/telemetry-settings-resolver.service', () => ({
    telemetrySettingsResolverService: {
        resolve: hoisted.resolveTelemetrySettings,
    },
}));

vi.mock('@sentinel/db', () => ({
    dbClient: {},
}));

describe('telemetry.worker', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        hoisted.handlers.clear();
        delete process.env.TELEMETRY_INGESTION_MODE;
        delete process.env.REDIS_URL;
        delete process.env.TELEMETRY_REDIS_QUEUE_NAME;
        hoisted.resolveTelemetrySettings.mockResolvedValue({
            updatedAt: null,
            value: {
                operations: {
                    ingestionMode: 'sync',
                },
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('exits gracefully without creating a worker when ingestion mode is not redis', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'sync';
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await import('./telemetry.worker');
        await vi.waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith(
                '[TelemetryWorker] Ingestion mode is set to "sync". Telemetry worker is inactive and exiting gracefully.',
            );
        });

        expect(hoisted.WorkerMock).not.toHaveBeenCalled();
    });

    it('starts when persisted telemetry settings request redis mode even if the environment is sync', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'sync';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        hoisted.resolveTelemetrySettings.mockResolvedValueOnce({
            updatedAt: new Date('2026-07-24T00:00:00.000Z'),
            value: {
                operations: {
                    ingestionMode: 'redis',
                },
            },
        });

        await import('./telemetry.worker');

        await vi.waitFor(() => {
            expect(hoisted.WorkerMock).toHaveBeenCalledWith(
                'telemetry-ingestion',
                expect.any(Function),
                expect.objectContaining({
                    connection: expect.anything(),
                    concurrency: 5,
                }),
            );
        });
    });

    it('logs attempt and event identifiers for failed jobs', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        process.env.TELEMETRY_REDIS_QUEUE_NAME = 'telemetry-ingestion';
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await import('./telemetry.worker');
        const failedHandler = hoisted.handlers.get('failed');

        expect(failedHandler).toBeTypeOf('function');

        failedHandler?.(
            {
                id: 'job-1',
                data: {
                    examSessionId: 'attempt-1',
                    studentId: 'student-1',
                    eventType: 'TAB_SWITCH',
                    ruleKey: 'webSecurity.tab_switching_monitor',
                    timestamp: '2026-07-11T10:00:00.000Z',
                    metadata: {
                        eventId: '123e4567-e89b-12d3-a456-426614174999',
                        dedupeKey: 'attempt-1:TAB_SWITCH:bucket-1',
                    },
                },
            },
            new Error('append failed'),
        );

        expect(errorSpy).toHaveBeenCalledWith('[TelemetryWorker] Failed to process job', {
            queueName: 'telemetry-ingestion',
            error: 'append failed',
            jobId: 'job-1',
            attemptId: 'attempt-1',
            studentId: 'student-1',
            eventType: 'TAB_SWITCH',
            ruleKey: 'webSecurity.tab_switching_monitor',
            timestamp: '2026-07-11T10:00:00.000Z',
            eventId: '123e4567-e89b-12d3-a456-426614174999',
            dedupeKey: 'attempt-1:TAB_SWITCH:bucket-1',
        });
    });

    it('logs stalled job identifiers without relying on Worker job lookup APIs', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        process.env.TELEMETRY_REDIS_QUEUE_NAME = 'telemetry-ingestion';
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await import('./telemetry.worker');
        const stalledHandler = hoisted.handlers.get('stalled');

        expect(stalledHandler).toBeTypeOf('function');

        await stalledHandler?.('job-2');

        expect(errorSpy).toHaveBeenCalledWith('[TelemetryWorker] Job stalled', {
            queueName: 'telemetry-ingestion',
            redisHost: '127.0.0.1',
            redisPort: '6379',
            jobId: 'job-2',
        });
    });

    it('logs completion details for successfully processed jobs', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        hoisted.processQueuedTelemetryEvent.mockResolvedValueOnce('inserted');

        await import('./telemetry.worker');

        const processor = hoisted.WorkerMock.mock.calls.find(
            (call) => call[0] === 'telemetry-ingestion',
        )?.[1];

        expect(processor).toBeTypeOf('function');

        const mockJob = {
            id: 'job-success-1',
            data: {
                examSessionId: 'attempt-3',
                studentId: 'student-3',
                eventType: 'TAB_SWITCH',
                ruleKey: 'webSecurity.tab_switching_monitor',
                timestamp: '2026-07-11T10:02:00.000Z',
                metadata: {
                    eventId: 'success-event-1',
                    dedupeKey: 'attempt-3:TAB_SWITCH:bucket-1',
                },
            },
        };

        await processor(mockJob);

        expect(hoisted.processQueuedTelemetryEvent).toHaveBeenCalledWith(
            expect.anything(),
            mockJob.data,
        );
        expect(logSpy).toHaveBeenCalledWith('[TelemetryWorker] Job completed', {
            queueName: 'telemetry-ingestion',
            jobId: 'job-success-1',
            outcome: 'inserted',
            attemptId: 'attempt-3',
            studentId: 'student-3',
            eventType: 'TAB_SWITCH',
            ruleKey: 'webSecurity.tab_switching_monitor',
            timestamp: '2026-07-11T10:02:00.000Z',
            eventId: 'success-event-1',
            dedupeKey: 'attempt-3:TAB_SWITCH:bucket-1',
        });
    });

    it('closes the worker and Redis connection on SIGTERM before exiting', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
        const processHandlers = new Map<string, (...args: any[]) => void>();
        const processOnSpy = vi
            .spyOn(process, 'on')
            .mockImplementation((event: string | symbol, handler: (...args: any[]) => void) => {
                processHandlers.set(event.toString(), handler);
                return process;
            });

        await import('./telemetry.worker');

        expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
        processHandlers.get('SIGTERM')?.();

        await vi.waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith('Shutting down telemetry worker after SIGTERM.');
            expect(hoisted.workerClose).toHaveBeenCalledOnce();
            expect(hoisted.closeRedisConnection).toHaveBeenCalledWith(
                hoisted.createRedisConnection.mock.results[0].value,
            );
            expect(exitSpy).toHaveBeenCalledWith(0);
        });
    });
});
