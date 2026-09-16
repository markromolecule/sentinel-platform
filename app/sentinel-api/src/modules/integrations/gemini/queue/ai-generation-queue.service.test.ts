import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import * as redisModule from '../../../../lib/redis/redis.service';
import * as configModule from './ai-generation-queue.config';
import { AiGenerationQueueService } from './ai-generation-queue.service';
import { AiGenerationWorkerProcessor, type AiGenerationJobData } from './ai-generation.worker';

describe('AiGenerationQueueService', () => {
    const mockPayload: AiGenerationJobData = {
        jobId: 'job-enqueue-123',
        userId: 'user-456',
        institutionId: 'inst-789',
        config: {
            questionCount: 20,
            promptType: 'lesson',
            difficultyDistribution: { Easy: 5, Medium: 10, Hard: 5 },
            cognitiveDistribution: { Remembering: 10, Understanding: 10 },
            questionTypes: ['multiple_choice'],
        },
    };

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(async () => {
        await AiGenerationQueueService.closeQueue();
    });

    it('throws HTTPException 503 in production mode when Redis is not configured', async () => {
        vi.spyOn(configModule, 'resolveQueueOperationalMode').mockReturnValue('redis');
        vi.spyOn(redisModule, 'hasRedisConfigured').mockReturnValue(false);

        await expect(AiGenerationQueueService.enqueueJob(mockPayload)).rejects.toThrow(HTTPException);

        try {
            await AiGenerationQueueService.enqueueJob(mockPayload);
        } catch (error: any) {
            expect(error.status).toBe(503);
            expect(error.message).toContain('Redis connection is required in production');
        }
    });

    it('dispatches job via BullMQ queue when in redis operational mode', async () => {
        vi.spyOn(configModule, 'resolveQueueOperationalMode').mockReturnValue('redis');
        vi.spyOn(redisModule, 'hasRedisConfigured').mockReturnValue(true);

        const mockAdd = vi.fn().mockResolvedValue({ id: mockPayload.jobId });
        (AiGenerationQueueService as any).queue = {
            add: mockAdd,
            close: vi.fn().mockResolvedValue(undefined),
        };

        await AiGenerationQueueService.enqueueJob(mockPayload);

        expect(mockAdd).toHaveBeenCalledWith('generate-preview', mockPayload, {
            jobId: mockPayload.jobId,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    });

    it('dispatches job via in-memory setImmediate loop when in development mode without Redis', async () => {
        vi.spyOn(configModule, 'resolveQueueOperationalMode').mockReturnValue('in-memory');

        const processJobSpy = vi.spyOn(AiGenerationWorkerProcessor, 'processJob').mockResolvedValue();

        await AiGenerationQueueService.enqueueJob(mockPayload);

        // Wait for setImmediate to execute
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(processJobSpy).toHaveBeenCalledWith(mockPayload);
    });

    it('reports queue health correctly based on mode', async () => {
        vi.spyOn(configModule, 'resolveQueueOperationalMode').mockReturnValue('in-memory');
        expect(await AiGenerationQueueService.isQueueHealthy()).toBe(true);

        vi.spyOn(configModule, 'resolveQueueOperationalMode').mockReturnValue('redis');
        vi.spyOn(redisModule, 'hasRedisConfigured').mockReturnValue(false);
        expect(await AiGenerationQueueService.isQueueHealthy()).toBe(false);
    });
});
