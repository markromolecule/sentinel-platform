import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
    const handlers = new Map<string, (...args: any[]) => any>();
    const workerGetJob = vi.fn();
    const workerClose = vi.fn().mockResolvedValue(undefined);
    const WorkerMock = vi.fn(function Worker() {
        return {
            on: vi.fn((event: string, handler: (...args: any[]) => any) => {
                handlers.set(event, handler);
                return this;
            }),
            getJob: workerGetJob,
            close: workerClose,
        };
    });

    return {
        WorkerMock,
        handlers,
        workerClose,
        workerGetJob,
        createRedisConnection: vi.fn(() => ({ quit: vi.fn(), disconnect: vi.fn() })),
        closeRedisConnection: vi.fn().mockResolvedValue(undefined),
        validateRedisConfig: vi.fn().mockResolvedValue(undefined),
        processQueuedTelemetryEvent: vi.fn().mockResolvedValue('persisted'),
    };
});

vi.mock('bullmq', () => ({
    Worker: hoisted.WorkerMock,
}));

vi.mock('../../../../lib/redis/redis.service', () => ({
    createRedisConnection: hoisted.createRedisConnection,
    closeRedisConnection: hoisted.closeRedisConnection,
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

    it('looks up stalled jobs and logs attempt and event identifiers when available', async () => {
        process.env.TELEMETRY_INGESTION_MODE = 'redis';
        process.env.REDIS_URL = 'redis://127.0.0.1:6379';
        process.env.TELEMETRY_REDIS_QUEUE_NAME = 'telemetry-ingestion';
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        hoisted.workerGetJob.mockResolvedValue({
            data: {
                examSessionId: 'attempt-2',
                studentId: 'student-2',
                eventType: 'COPY_ATTEMPT',
                ruleKey: 'webSecurity.clipboard_monitor',
                timestamp: '2026-07-11T10:01:00.000Z',
                metadata: {
                    eventId: '223e4567-e89b-12d3-a456-426614174999',
                    dedupeKey: 'attempt-2:COPY_ATTEMPT:bucket-1',
                },
            },
        });

        await import('./telemetry.worker');
        const stalledHandler = hoisted.handlers.get('stalled');

        expect(stalledHandler).toBeTypeOf('function');

        await stalledHandler?.('job-2');

        expect(hoisted.workerGetJob).toHaveBeenCalledWith('job-2');
        expect(errorSpy).toHaveBeenCalledWith('[TelemetryWorker] Job stalled', {
            queueName: 'telemetry-ingestion',
            redisHost: '127.0.0.1',
            redisPort: '6379',
            jobId: 'job-2',
            attemptId: 'attempt-2',
            studentId: 'student-2',
            eventType: 'COPY_ATTEMPT',
            ruleKey: 'webSecurity.clipboard_monitor',
            timestamp: '2026-07-11T10:01:00.000Z',
            eventId: '223e4567-e89b-12d3-a456-426614174999',
            dedupeKey: 'attempt-2:COPY_ATTEMPT:bucket-1',
        });
    });
});
