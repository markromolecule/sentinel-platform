import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
    AiGenerationWorkerProcessor,
    type AiGenerationJobData,
    handleWorkerError,
    resetCircuitBreakerForTesting,
    getWorkerCircuitBreakerState,
} from './ai-generation.worker';
import {
    AiGenerationInputStorageService,
    AiGenerationInputStorageError,
} from '../services/ai-generation-input-storage.service';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';
import { QuestionGeneratorService } from '../../../../lib/gemini/services/question-generator';

describe('AiGenerationWorkerProcessor', () => {
    const mockData: AiGenerationJobData = {
        jobId: 'test-worker-job-1',
        userId: 'user-1',
        institutionId: 'inst-1',
        config: {
            questionCount: 10,
            promptType: 'lesson',
            difficultyDistribution: { Easy: 5, Medium: 5 },
            cognitiveDistribution: { Remembering: 5, Understanding: 5 },
            questionTypes: ['multiple_choice'],
        },
        storageBucket: 'ai-generation-staging',
        storagePaths: [
            {
                path: 'test-worker-job-1/001-test.pdf',
                originalName: 'test.pdf',
                contentType: 'application/pdf',
                sizeBytes: 1024,
            },
        ],
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(AiGenerationJobRepository, 'updateProgress').mockResolvedValue();
        vi.spyOn(AiGenerationJobRepository, 'completeJob').mockResolvedValue();
        vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();
    });

    it('processes job end-to-end reading from storage manifest and updates progress', async () => {
        const dummyFile = new File([Buffer.from('pdf data')], 'test.pdf', {
            type: 'application/pdf',
        });
        const downloadSpy = vi
            .spyOn(AiGenerationInputStorageService, 'downloadManifestFiles')
            .mockResolvedValue([dummyFile]);

        const updateProgressSpy = vi
            .spyOn(AiGenerationJobRepository, 'updateProgress')
            .mockResolvedValue();
        const completeJobSpy = vi
            .spyOn(AiGenerationJobRepository, 'completeJob')
            .mockResolvedValue();

        const mockResponse: any = {
            questions: [{ id: 'q-1', text: 'Sample Question' }],
            sourceDocuments: [],
            warnings: [],
            telemetry: {},
        };

        vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockImplementation(
            async (args) => {
                if (args.onProgress) {
                    await args.onProgress(50, 'Halfway done');
                }
                return mockResponse;
            },
        );

        await AiGenerationWorkerProcessor.processJob(mockData);

        expect(downloadSpy).toHaveBeenCalledWith({
            bucket: 'ai-generation-staging',
            objects: mockData.storagePaths,
        });
        expect(updateProgressSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                progress: 5,
                currentStep: 'Staging lecture documents...',
            }),
        );
        expect(updateProgressSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                progress: 50,
                currentStep: 'Halfway done',
            }),
        );
        expect(completeJobSpy).toHaveBeenCalledWith({
            id: 'test-worker-job-1',
            result: mockResponse,
            db: undefined,
        });
    });

    it('worker falls back to fetching job manifest from DB if not provided in payload', async () => {
        const dummyFile = new File([Buffer.from('pdf data')], 'test.pdf', {
            type: 'application/pdf',
        });
        const getJobSpy = vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue({
            id: 'test-worker-job-1',
            storage_bucket: 'ai-generation-staging',
            storage_paths: [
                {
                    path: 'test-worker-job-1/001-test.pdf',
                    originalName: 'test.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 1024,
                },
            ],
        } as any);

        const downloadSpy = vi
            .spyOn(AiGenerationInputStorageService, 'downloadManifestFiles')
            .mockResolvedValue([dummyFile]);
        vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockResolvedValue({
            questions: [],
        } as any);

        const payloadWithoutStorage: AiGenerationJobData = {
            jobId: 'test-worker-job-1',
            userId: 'user-1',
            config: mockData.config,
        };

        await AiGenerationWorkerProcessor.processJob(payloadWithoutStorage);

        expect(getJobSpy).toHaveBeenCalledWith('test-worker-job-1', undefined);
        expect(downloadSpy).toHaveBeenCalledWith({
            bucket: 'ai-generation-staging',
            objects: [
                {
                    path: 'test-worker-job-1/001-test.pdf',
                    originalName: 'test.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 1024,
                },
            ],
        });
    });

    it('fails safely with safe error and discards job when manifest is missing without retrying', async () => {
        vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(null);
        const failJobSpy = vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();
        const discardSpy = vi.fn();

        await AiGenerationWorkerProcessor.processJob(
            {
                jobId: 'test-worker-job-1',
                userId: 'user-1',
                config: mockData.config,
            },
            {
                attempt: 1,
                maxAttempts: 3,
                discard: discardSpy,
            },
        );

        expect(failJobSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                error: 'No staged document files found for generation job',
            }),
        );
        expect(discardSpy).toHaveBeenCalledTimes(1);
    });

    it('fails safely when downloadManifestFiles throws permanent non-retryable MISSING_INPUT error', async () => {
        vi.spyOn(AiGenerationInputStorageService, 'downloadManifestFiles').mockRejectedValue(
            new AiGenerationInputStorageError('MISSING_INPUT', 'Object not found in storage', false),
        );
        const failJobSpy = vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();
        const discardSpy = vi.fn();

        await AiGenerationWorkerProcessor.processJob(mockData, {
            attempt: 1,
            maxAttempts: 3,
            discard: discardSpy,
        });

        expect(failJobSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                error: 'No staged document files found for generation job',
            }),
        );
        expect(discardSpy).toHaveBeenCalledTimes(1);
    });

    it('first and second retry attempts are nonterminal: records progress and rethrows without calling failJob', async () => {
        const dummyFile = new File([Buffer.from('pdf data')], 'test.pdf', {
            type: 'application/pdf',
        });
        vi.spyOn(AiGenerationInputStorageService, 'downloadManifestFiles').mockResolvedValue([
            dummyFile,
        ]);
        vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockRejectedValue(
            new Error('Gemini upstream network reset'),
        );

        const updateProgressSpy = vi
            .spyOn(AiGenerationJobRepository, 'updateProgress')
            .mockResolvedValue();
        const failJobSpy = vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();

        // Attempt 1 of 3
        await expect(
            AiGenerationWorkerProcessor.processJob(mockData, {
                attempt: 1,
                maxAttempts: 3,
            }),
        ).rejects.toThrow('Gemini upstream network reset');

        expect(failJobSpy).not.toHaveBeenCalled();
        expect(updateProgressSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                status: 'processing',
                currentStep: expect.stringContaining('Retrying attempt 2 of 3'),
            }),
        );

        // Attempt 2 of 3
        await expect(
            AiGenerationWorkerProcessor.processJob(mockData, {
                attempt: 2,
                maxAttempts: 3,
            }),
        ).rejects.toThrow('Gemini upstream network reset');

        expect(failJobSpy).not.toHaveBeenCalled();
        expect(updateProgressSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                status: 'processing',
                currentStep: expect.stringContaining('Retrying attempt 3 of 3'),
            }),
        );
    });

    it('third failure is terminal: calls failJob with error message', async () => {
        const dummyFile = new File([Buffer.from('pdf data')], 'test.pdf', {
            type: 'application/pdf',
        });
        vi.spyOn(AiGenerationInputStorageService, 'downloadManifestFiles').mockResolvedValue([
            dummyFile,
        ]);
        vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockRejectedValue(
            new Error('Persistent Gemini outage'),
        );

        const failJobSpy = vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();

        // Attempt 3 of 3 (final attempt)
        await expect(
            AiGenerationWorkerProcessor.processJob(mockData, {
                attempt: 3,
                maxAttempts: 3,
            }),
        ).rejects.toThrow('Persistent Gemini outage');

        expect(failJobSpy).toHaveBeenCalledWith({
            id: 'test-worker-job-1',
            error: 'Persistent Gemini outage',
            db: undefined,
        });
    });

    it('cleanExpiredJobs deletes storage objects before purging database rows', async () => {
        const executionOrder: string[] = [];
        const expiredMockJob = {
            id: 'exp-job-1',
            storage_bucket: 'ai-generation-staging',
            storage_paths: [
                {
                    path: 'exp-job-1/001-doc.pdf',
                    originalName: 'doc.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 500,
                },
            ],
        };

        vi.spyOn(AiGenerationJobRepository, 'getExpiredJobs').mockResolvedValue([
            expiredMockJob as any,
        ]);
        const deleteObjectsSpy = vi
            .spyOn(AiGenerationInputStorageService, 'deleteObjects')
            .mockImplementation(async () => {
                executionOrder.push('deleteObjects');
            });
        const deleteJobSpy = vi
            .spyOn(AiGenerationJobRepository, 'deleteJob')
            .mockImplementation(async () => {
                executionOrder.push('deleteJob');
                return true;
            });

        const result = await AiGenerationWorkerProcessor.cleanExpiredJobs();

        expect(executionOrder).toEqual(['deleteObjects', 'deleteJob']);
        expect(deleteObjectsSpy).toHaveBeenCalledWith({
            bucket: 'ai-generation-staging',
            paths: ['exp-job-1/001-doc.pdf'],
        });
        expect(deleteJobSpy).toHaveBeenCalledWith('exp-job-1', undefined);
        expect(result).toEqual({
            checkedCount: 1,
            cleanedCount: 1,
            failedCount: 0,
        });
    });

    it('cleanExpiredJobs converges and deletes DB row when storage objects are already missing', async () => {
        const expiredMockJob = {
            id: 'exp-job-missing',
            storage_bucket: 'ai-generation-staging',
            storage_paths: [
                {
                    path: 'exp-job-missing/001-doc.pdf',
                    originalName: 'doc.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 500,
                },
            ],
        };

        vi.spyOn(AiGenerationJobRepository, 'getExpiredJobs').mockResolvedValue([
            expiredMockJob as any,
        ]);
        vi.spyOn(AiGenerationInputStorageService, 'deleteObjects').mockResolvedValue();
        const deleteJobSpy = vi
            .spyOn(AiGenerationJobRepository, 'deleteJob')
            .mockResolvedValue(true);

        const result = await AiGenerationWorkerProcessor.cleanExpiredJobs();

        expect(deleteJobSpy).toHaveBeenCalledWith('exp-job-missing', undefined);
        expect(result.cleanedCount).toBe(1);
        expect(result.failedCount).toBe(0);
    });

    it('cleanExpiredJobs retains database row when storage object deletion throws an error', async () => {
        const expiredMockJob = {
            id: 'exp-job-err',
            storage_bucket: 'ai-generation-staging',
            storage_paths: [
                {
                    path: 'exp-job-err/001-doc.pdf',
                    originalName: 'doc.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 500,
                },
            ],
        };

        vi.spyOn(AiGenerationJobRepository, 'getExpiredJobs').mockResolvedValue([
            expiredMockJob as any,
        ]);
        vi.spyOn(AiGenerationInputStorageService, 'deleteObjects').mockRejectedValue(
            new AiGenerationInputStorageError('STORAGE_TRANSPORT', 'Supabase storage gateway down', true),
        );
        const deleteJobSpy = vi
            .spyOn(AiGenerationJobRepository, 'deleteJob')
            .mockResolvedValue(true);

        const result = await AiGenerationWorkerProcessor.cleanExpiredJobs();

        expect(deleteJobSpy).not.toHaveBeenCalled();
        expect(result.cleanedCount).toBe(0);
        expect(result.failedCount).toBe(1);
    });

    it('runMaintenanceCycle coordinates stuck job reconciliation and expired job cleanup', async () => {
        const reconcileSpy = vi
            .spyOn(AiGenerationJobRepository, 'reconcileStuckJobs')
            .mockResolvedValue(4);
        const cleanSpy = vi
            .spyOn(AiGenerationWorkerProcessor, 'cleanExpiredJobs')
            .mockResolvedValue({
                checkedCount: 2,
                cleanedCount: 2,
                failedCount: 0,
            });

        const outcome = await AiGenerationWorkerProcessor.runMaintenanceCycle();

        expect(reconcileSpy).toHaveBeenCalledWith(15, undefined);
        expect(cleanSpy).toHaveBeenCalledWith(undefined);
        expect(outcome).toEqual({
            reconciledCount: 4,
            cleanup: {
                checkedCount: 2,
                cleanedCount: 2,
                failedCount: 0,
            },
        });
    });
});

describe('AiWorker Circuit Breaker & Error Backoff', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetCircuitBreakerForTesting();
    });

    afterEach(() => {
        resetCircuitBreakerForTesting();
        vi.useRealTimers();
    });

    it('trips circuit breaker and pauses worker on internal error, then resumes after backoff', async () => {
        const mockWorker = {
            pause: vi.fn().mockResolvedValue(undefined),
            resume: vi.fn().mockReturnValue(undefined),
            closing: undefined,
            isPaused: vi.fn().mockReturnValue(true),
        } as any;

        const delay = await handleWorkerError(
            new Error('ReplyError: ERR max requests limit exceeded'),
            mockWorker,
            { baseDelayMs: 100, maxDelayMs: 1000 },
        );

        expect(delay).toBe(100);
        expect(mockWorker.pause).toHaveBeenCalledWith(true);
        expect(getWorkerCircuitBreakerState().isBackoffActive).toBe(true);
        expect(getWorkerCircuitBreakerState().consecutiveErrors).toBe(1);

        // Advance timers by backoff delay
        await vi.advanceTimersByTimeAsync(100);

        expect(mockWorker.resume).toHaveBeenCalled();
        expect(getWorkerCircuitBreakerState().isBackoffActive).toBe(false);
    });

    it('exponentially increases backoff delay on repeated errors up to max', async () => {
        const mockWorker = {
            pause: vi.fn().mockResolvedValue(undefined),
            resume: vi.fn().mockReturnValue(undefined),
            closing: undefined,
            isPaused: vi.fn().mockReturnValue(true),
        } as any;

        // 1st error: 100ms
        const delay1 = await handleWorkerError(new Error('Connection error 1'), mockWorker, {
            baseDelayMs: 100,
            maxDelayMs: 500,
        });
        expect(delay1).toBe(100);
        await vi.advanceTimersByTimeAsync(100);

        // 2nd error: 200ms
        const delay2 = await handleWorkerError(new Error('Connection error 2'), mockWorker, {
            baseDelayMs: 100,
            maxDelayMs: 500,
        });
        expect(delay2).toBe(200);
        await vi.advanceTimersByTimeAsync(200);

        // 3rd error: 400ms
        const delay3 = await handleWorkerError(new Error('Connection error 3'), mockWorker, {
            baseDelayMs: 100,
            maxDelayMs: 500,
        });
        expect(delay3).toBe(400);
        await vi.advanceTimersByTimeAsync(400);

        // 4th error: capped at 500ms
        const delay4 = await handleWorkerError(new Error('Connection error 4'), mockWorker, {
            baseDelayMs: 100,
            maxDelayMs: 500,
        });
        expect(delay4).toBe(500);
    });

    it('does not re-trigger pause while backoff is already active', async () => {
        const mockWorker = {
            pause: vi.fn().mockResolvedValue(undefined),
            resume: vi.fn().mockReturnValue(undefined),
            closing: undefined,
            isPaused: vi.fn().mockReturnValue(true),
        } as any;

        const delay1 = await handleWorkerError(new Error('First error'), mockWorker, {
            baseDelayMs: 500,
        });
        expect(delay1).toBe(500);
        expect(mockWorker.pause).toHaveBeenCalledTimes(1);

        // Subsequent error while backoff active should return null and not call pause again
        const delay2 = await handleWorkerError(new Error('Second rapid error'), mockWorker, {
            baseDelayMs: 500,
        });
        expect(delay2).toBeNull();
        expect(mockWorker.pause).toHaveBeenCalledTimes(1);
    });

    it('does not resume worker if worker is closing when backoff window elapses', async () => {
        const mockWorker = {
            pause: vi.fn().mockResolvedValue(undefined),
            resume: vi.fn().mockReturnValue(undefined),
            closing: Promise.resolve(),
            isPaused: vi.fn().mockReturnValue(true),
        } as any;

        await handleWorkerError(new Error('Some error'), mockWorker, {
            baseDelayMs: 100,
            maxDelayMs: 1000,
        });

        expect(mockWorker.pause).toHaveBeenCalledWith(true);

        // Advance timer past backoff delay
        await vi.advanceTimersByTimeAsync(100);

        // resume should not have been called because worker is closing
        expect(mockWorker.resume).not.toHaveBeenCalled();
    });
});

