import { createRedisConnection, hasRedisConfigured } from './redis.service';
export { hasRedisConfigured };
import type IORedis from 'ioredis';

let redisClient: IORedis | null = null;

export const getRedisClient = (): IORedis | null => {
    if (!hasRedisConfigured()) {
        return null;
    }

    if (!redisClient) {
        redisClient = createRedisConnection('producer');

        // Add event listeners for monitoring readiness
        redisClient.on('connect', () => {
            console.log('Redis: Connecting...');
        });

        redisClient.on('ready', () => {
            console.log('Redis: Connection established and ready.');
        });

        redisClient.on('error', (err) => {
            console.error('Redis: Connection error:', err.message);
        });

        redisClient.on('close', () => {
            console.warn('Redis: Connection closed.');
        });
    }

    return redisClient;
};
