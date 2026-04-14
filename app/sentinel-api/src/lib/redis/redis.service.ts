import IORedis from 'ioredis';

export type RedisConnectionRole = 'producer' | 'worker';

const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;

const getRedisUrl = (): string | undefined => {
    return process.env.REDIS_URL?.trim() || undefined;
};

export const hasRedisConfigured = (): boolean => {
    return Boolean(getRedisUrl());
};

export const assertRedisConfigured = (): string => {
    const redisUrl = getRedisUrl();

    if (!redisUrl) {
        throw new Error('REDIS_URL is required when TELEMETRY_INGESTION_MODE is set to redis.');
    }

    return redisUrl;
};

export const createRedisConnection = (role: RedisConnectionRole = 'producer'): IORedis => {
    const redisUrl = assertRedisConfigured();

    return new IORedis(redisUrl, {
        connectTimeout: DEFAULT_CONNECT_TIMEOUT_MS,
        enableOfflineQueue: true, // Allow queuing commands while connecting
        lazyConnect: false, // Connect immediately at startup
        maxRetriesPerRequest: role === 'worker' ? null : 1,
    });
};

export const closeRedisConnection = async (
    connection: Pick<IORedis, 'quit' | 'disconnect'> | null | undefined,
): Promise<void> => {
    if (!connection) {
        return;
    }

    try {
        await connection.quit();
    } catch {
        connection.disconnect();
    }
};
