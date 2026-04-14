import type IORedis from 'ioredis';
import {
    closeRedisConnection,
    createRedisConnection,
    hasRedisConfigured,
} from '../../../../lib/redis/redis.service';
import type { ProctoringEventBody } from '../ingestion.dto';

export class TelemetryAggregationService {
    private connection: IORedis | null = null;

    async incrementWindowCount(
        payload: ProctoringEventBody,
        windowSeconds: number,
    ): Promise<number | null> {
        if (!hasRedisConfigured()) {
            return null;
        }

        const key = this.buildCounterKey(payload);
        const connection = this.getConnection();
        const count = await connection.incr(key);

        if (count === 1) {
            await connection.expire(key, windowSeconds);
        }

        return count;
    }

    async close(): Promise<void> {
        await closeRedisConnection(this.connection);
        this.connection = null;
    }

    resetForTests(): void {
        this.connection = null;
    }

    private getConnection(): IORedis {
        if (!this.connection) {
            this.connection = createRedisConnection('producer');
        }

        return this.connection;
    }

    private buildCounterKey(payload: ProctoringEventBody): string {
        return [
            'telemetry',
            'important-log-window',
            payload.platform,
            payload.ruleKey,
            payload.examSessionId,
            payload.studentId,
        ].join(':');
    }
}

export const telemetryAggregationService = new TelemetryAggregationService();
