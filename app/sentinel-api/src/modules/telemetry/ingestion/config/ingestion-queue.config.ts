import type { JobsOptions } from 'bullmq';

export type TelemetryQueueMode = 'sync' | 'redis';

const DEFAULT_QUEUE_NAME = 'telemetry-ingestion';
const DEFAULT_JOB_NAME = 'append-proctoring-event';
const DEFAULT_JOB_ATTEMPTS = 3;
const DEFAULT_JOB_BACKOFF_MS = 1_000;
const DEFAULT_REMOVE_ON_COMPLETE_COUNT = 1_000;
const DEFAULT_REMOVE_ON_FAIL_COUNT = 5_000;
const DEFAULT_WORKER_CONCURRENCY = 5;

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
};

export const getTelemetryIngestionMode = (): TelemetryQueueMode => {
    const configuredMode = process.env.TELEMETRY_INGESTION_MODE?.trim().toLowerCase();

    if (configuredMode === 'redis' || configuredMode === 'async') {
        return 'redis';
    }

    return 'sync';
};

export const getTelemetryQueueName = (): string => {
    return process.env.TELEMETRY_REDIS_QUEUE_NAME?.trim() || DEFAULT_QUEUE_NAME;
};

export const getTelemetryJobName = (): string => {
    return process.env.TELEMETRY_REDIS_JOB_NAME?.trim() || DEFAULT_JOB_NAME;
};

export const getTelemetryWorkerConcurrency = (): number => {
    return parsePositiveInteger(
        process.env.TELEMETRY_INGESTION_WORKER_CONCURRENCY,
        DEFAULT_WORKER_CONCURRENCY,
    );
};

export const getTelemetryJobOptions = (): JobsOptions => {
    return {
        attempts: parsePositiveInteger(
            process.env.TELEMETRY_INGESTION_ATTEMPTS,
            DEFAULT_JOB_ATTEMPTS,
        ),
        backoff: {
            type: 'exponential',
            delay: parsePositiveInteger(
                process.env.TELEMETRY_INGESTION_BACKOFF_MS,
                DEFAULT_JOB_BACKOFF_MS,
            ),
        },
        removeOnComplete: {
            count: parsePositiveInteger(
                process.env.TELEMETRY_INGESTION_KEEP_COMPLETED,
                DEFAULT_REMOVE_ON_COMPLETE_COUNT,
            ),
        },
        removeOnFail: {
            count: parsePositiveInteger(
                process.env.TELEMETRY_INGESTION_KEEP_FAILED,
                DEFAULT_REMOVE_ON_FAIL_COUNT,
            ),
        },
    };
};

const DEFAULT_BUFFER_NAME = 'telemetry-buffer';

export const getTelemetryBufferName = (): string => {
    return process.env.TELEMETRY_REDIS_BUFFER_NAME?.trim() || DEFAULT_BUFFER_NAME;
};
