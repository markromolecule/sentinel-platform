import { Queue } from 'bullmq';
import { HTTPException } from 'hono/http-exception';
import { createRedisConnection, closeRedisConnection, hasRedisConfigured } from '../../../../lib/redis/redis.service';
import {
    getAiGenerationQueueName,
    resolveQueueOperationalMode,
} from './ai-generation-queue.config';
import {
    AiGenerationWorkerProcessor,
    type AiGenerationJobData,
} from './ai-generation.worker';

export class AiGenerationQueueService {
    private static queue: Queue<AiGenerationJobData> | null = null;
    private static producerConnection: any = null;

    private static getQueue(): Queue<AiGenerationJobData> {
        if (!this.queue) {
            this.producerConnection = createRedisConnection('producer');
            this.queue = new Queue<AiGenerationJobData>(getAiGenerationQueueName(), {
                connection: this.producerConnection,
                defaultJobOptions: {
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            });
        }
        return this.queue;
    }

    /**
     * Enqueues an AI generation task.
     * In production: Mandates BullMQ + Redis; throws 503 if Redis is disconnected.
     * In development: Dispatches via BullMQ if Redis is available, or falls back to in-memory processing.
     */
    static async enqueueJob(payload: AiGenerationJobData): Promise<void> {
        const mode = resolveQueueOperationalMode();

        if (mode === 'redis') {
            if (!hasRedisConfigured()) {
                throw new HTTPException(503, {
                    message:
                        'AI generation queue service is temporarily unavailable. Redis connection is required in production.',
                });
            }

            try {
                const queue = this.getQueue();
                await queue.add('generate-preview', payload, {
                    jobId: payload.jobId,
                });
                console.log(`[AiGenerationQueue] Enqueued job ${payload.jobId} to BullMQ queue`);
            } catch (error: any) {
                console.error('[AiGenerationQueue] Failed to enqueue job to BullMQ:', error);
                throw new HTTPException(503, {
                    message:
                        'Unable to enqueue AI generation task to the background queue. Please try again shortly.',
                });
            }
            return;
        }

        // In-memory fallback (strictly development)
        console.log(
            `[AiGenerationQueue] Redis not configured in development. Processing job ${payload.jobId} via in-memory worker loop.`,
        );

        setImmediate(async () => {
            try {
                await AiGenerationWorkerProcessor.processJob(payload);
            } catch (err: any) {
                console.error(
                    `[AiGenerationQueue] Error in in-memory fallback processor for job ${payload.jobId}:`,
                    err,
                );
            }
        });
    }

    /**
     * Checks if the queue engine is healthy and operational.
     */
    static async isQueueHealthy(): Promise<boolean> {
        const mode = resolveQueueOperationalMode();
        if (mode === 'in-memory') {
            return true;
        }

        if (!hasRedisConfigured()) {
            return false;
        }

        try {
            const queue = this.getQueue();
            await queue.getJobCounts('waiting', 'active');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Closes the BullMQ queue instance and connection.
     */
    static async closeQueue(): Promise<void> {
        if (this.queue) {
            try {
                if (typeof (this.queue as any).close === 'function') {
                    await this.queue.close();
                }
            } catch (err) {
                console.error('[AiGenerationQueue] Error closing queue:', err);
            }
            this.queue = null;
        }
        if (this.producerConnection) {
            await closeRedisConnection(this.producerConnection);
            this.producerConnection = null;
        }
    }
}
