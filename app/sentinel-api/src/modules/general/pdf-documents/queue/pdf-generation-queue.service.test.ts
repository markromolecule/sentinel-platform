import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PdfGenerationQueueService } from './pdf-generation-queue.service';

const { addMock, closeMock, createRedisConnectionMock, closeRedisConnectionMock, queueCtorMock } =
    vi.hoisted(() => ({
        addMock: vi.fn().mockResolvedValue(undefined),
        closeMock: vi.fn().mockResolvedValue(undefined),
        createRedisConnectionMock: vi.fn().mockReturnValue({ connection: 'redis' }),
        closeRedisConnectionMock: vi.fn().mockResolvedValue(undefined),
        queueCtorMock: vi.fn(),
    }));

vi.mock('bullmq', () => ({
    Queue: class MockQueue {
        constructor(name: string, options: any) {
            queueCtorMock(name, options);
        }

        add = addMock;
        close = closeMock;
    },
}));

vi.mock('../../../../lib/redis/redis.service', () => ({
    createRedisConnection: createRedisConnectionMock,
    closeRedisConnection: closeRedisConnectionMock,
}));

describe('PdfGenerationQueueService', () => {
    let service: PdfGenerationQueueService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new PdfGenerationQueueService();
    });

    it('creates the queue lazily and reuses it', async () => {
        const first = await service.getQueue();
        const second = await service.getQueue();

        expect(first).toBe(second);
        expect(createRedisConnectionMock).toHaveBeenCalledTimes(1);
        expect(queueCtorMock).toHaveBeenCalledTimes(1);
        expect(queueCtorMock).toHaveBeenCalledWith(
            'pdf-generation',
            expect.objectContaining({
                connection: { connection: 'redis' },
                defaultJobOptions: expect.objectContaining({
                    attempts: 3,
                }),
            }),
        );
    });

    it('submits jobs using the export id as jobId', async () => {
        await service.submitPdfJob('export-123', 'ANALYTICS_OVERALL');

        expect(addMock).toHaveBeenCalledWith(
            'generate-pdf',
            { exportId: 'export-123', documentKind: 'ANALYTICS_OVERALL' },
            { jobId: 'export-123' },
        );
    });

    it('closes the queue and redis connection gracefully', async () => {
        await service.getQueue();
        await service.close();

        expect(closeMock).toHaveBeenCalledTimes(1);
        expect(closeRedisConnectionMock).toHaveBeenCalledWith({ connection: 'redis' });
    });
});
