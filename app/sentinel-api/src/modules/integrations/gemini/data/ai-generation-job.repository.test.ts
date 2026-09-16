import { describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { AiGenerationJobRepository } from './ai-generation-job.repository';
import type { GenerateQuestionPreviewConfig, GenerateQuestionPreviewResponse } from '@sentinel/shared';

describe('AiGenerationJobRepository', () => {
    const mockConfig: GenerateQuestionPreviewConfig = {
        questionCount: 40,
        promptType: 'lesson',
        difficultyDistribution: { Easy: 10, Medium: 20, Hard: 10 },
        cognitiveDistribution: { Remembering: 20, Understanding: 20 },
        questionTypes: ['multiple_choice'],
    };

    const mockResult: GenerateQuestionPreviewResponse = {
        questions: [
            {
                id: 'q-1',
                type: 'multiple_choice',
                text: 'Sample question text',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'A',
                explanation: 'Explanation',
                cognitiveLevel: 'Remembering',
                difficulty: 'Easy',
            },
        ],
        sourceDocuments: [],
        warnings: [],
        telemetry: {
            batchesAttempted: 4,
            batchesSucceeded: 4,
            rawQuestionsGenerated: 40,
            normalizedQuestionsCount: 40,
            totalPipelineDurationMs: 85000,
        },
    };

    it('creates a new generation job with 24-hour TTL and default queued status', async () => {
        const mockRow = {
            id: 'job-123',
            user_id: 'user-456',
            institution_id: 'inst-789',
            status: 'queued',
            progress: 0,
            current_step: 'Queued',
            config: mockConfig,
            result: null,
            error: null,
            storage_bucket: 'ai-generation-staging',
            storage_paths: [
                {
                    path: 'job-123/001-lesson.pdf',
                    originalName: 'lesson.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 1024,
                },
            ],
            expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const executeTakeFirstOrThrow = vi.fn().mockResolvedValue(mockRow);
        const returningAll = vi.fn().mockReturnValue({ executeTakeFirstOrThrow });
        const values = vi.fn().mockReturnValue({ returningAll });
        const insertInto = vi.fn().mockReturnValue({ values });

        const mockDb = { insertInto } as unknown as DbClient;

        const job = await AiGenerationJobRepository.createJob(
            {
                id: 'job-123',
                userId: 'user-456',
                institutionId: 'inst-789',
                config: mockConfig,
                storageBucket: 'ai-generation-staging',
                storagePaths: [
                    {
                        path: 'job-123/001-lesson.pdf',
                        originalName: 'lesson.pdf',
                        contentType: 'application/pdf',
                        sizeBytes: 1024,
                    },
                ],
            },
            mockDb,
        );

        expect(insertInto).toHaveBeenCalledWith('ai_generation_jobs');
        expect(values).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'job-123',
                user_id: 'user-456',
                institution_id: 'inst-789',
                status: 'queued',
                progress: 0,
                current_step: 'Queued',
                storage_bucket: 'ai-generation-staging',
            }),
        );
        expect(job.id).toBe('job-123');
        expect(job.status).toBe('queued');
        expect(job.progress).toBe(0);
        expect(job.result).toBeNull();
        expect(job.storage_paths).toEqual([
            {
                path: 'job-123/001-lesson.pdf',
                originalName: 'lesson.pdf',
                contentType: 'application/pdf',
                sizeBytes: 1024,
            },
        ]);
    });

    it('retrieves an existing generation job by id', async () => {
        const mockRow = {
            id: 'job-123',
            user_id: 'user-456',
            institution_id: 'inst-789',
            status: 'processing',
            progress: 45,
            current_step: 'Generating batch 2 of 5',
            config: JSON.stringify(mockConfig),
            result: null,
            error: null,
            storage_bucket: 'ai-generation-staging',
            storage_paths: JSON.stringify([
                {
                    path: 'job-123/001-lesson.pdf',
                    originalName: 'lesson.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 1024,
                },
            ]),
            expires_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const executeTakeFirst = vi.fn().mockResolvedValue(mockRow);
        const selectAll = vi.fn().mockReturnValue({ executeTakeFirst });
        const where = vi.fn().mockReturnValue({ selectAll });
        const selectFrom = vi.fn().mockReturnValue({ where });

        const mockDb = { selectFrom } as unknown as DbClient;

        const job = await AiGenerationJobRepository.getJobById('job-123', mockDb);

        expect(selectFrom).toHaveBeenCalledWith('ai_generation_jobs');
        expect(where).toHaveBeenCalledWith('id', '=', 'job-123');
        expect(job).not.toBeNull();
        expect(job?.progress).toBe(45);
        expect(job?.current_step).toBe('Generating batch 2 of 5');
        expect(job?.storage_bucket).toBe('ai-generation-staging');
    });

    it('returns null if job does not exist', async () => {
        const executeTakeFirst = vi.fn().mockResolvedValue(null);
        const selectAll = vi.fn().mockReturnValue({ executeTakeFirst });
        const where = vi.fn().mockReturnValue({ selectAll });
        const selectFrom = vi.fn().mockReturnValue({ where });

        const mockDb = { selectFrom } as unknown as DbClient;

        const job = await AiGenerationJobRepository.getJobById('non-existent', mockDb);
        expect(job).toBeNull();
    });

    it('updates job progress clamped between 0 and 100', async () => {
        const execute = vi.fn().mockResolvedValue([]);
        const where = vi.fn().mockReturnValue({ execute });
        const set = vi.fn().mockReturnValue({ where });
        const updateTable = vi.fn().mockReturnValue({ set });

        const mockDb = { updateTable } as unknown as DbClient;

        await AiGenerationJobRepository.updateProgress({
            id: 'job-123',
            progress: 65.7,
            currentStep: 'Normalizing questions',
            db: mockDb,
        });

        expect(updateTable).toHaveBeenCalledWith('ai_generation_jobs');
        expect(set).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'processing',
                progress: 66,
                current_step: 'Normalizing questions',
            }),
        );
        expect(where).toHaveBeenCalledWith('id', '=', 'job-123');
    });

    it('completes job with 100% progress and result payload', async () => {
        const execute = vi.fn().mockResolvedValue([]);
        const where = vi.fn().mockReturnValue({ execute });
        const set = vi.fn().mockReturnValue({ where });
        const updateTable = vi.fn().mockReturnValue({ set });

        const mockDb = { updateTable } as unknown as DbClient;

        await AiGenerationJobRepository.completeJob({
            id: 'job-123',
            result: mockResult,
            db: mockDb,
        });

        expect(set).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'completed',
                progress: 100,
                result: mockResult,
                error: null,
            }),
        );
    });

    it('marks job as failed with error message', async () => {
        const execute = vi.fn().mockResolvedValue([]);
        const where = vi.fn().mockReturnValue({ execute });
        const set = vi.fn().mockReturnValue({ where });
        const updateTable = vi.fn().mockReturnValue({ set });

        const mockDb = { updateTable } as unknown as DbClient;

        await AiGenerationJobRepository.failJob({
            id: 'job-123',
            error: 'Vertex AI quota exceeded (429)',
            db: mockDb,
        });

        expect(set).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'failed',
                error: 'Vertex AI quota exceeded (429)',
            }),
        );
    });

    it('reconciles stuck jobs older than threshold into failed status', async () => {
        const executeTakeFirst = vi.fn().mockResolvedValue({ numUpdatedRows: 3n });
        const whereSecond = vi.fn().mockReturnValue({ executeTakeFirst });
        const whereFirst = vi.fn().mockReturnValue({ where: whereSecond });
        const set = vi.fn().mockReturnValue({ where: whereFirst });
        const updateTable = vi.fn().mockReturnValue({ set });

        const mockDb = { updateTable } as unknown as DbClient;

        const updatedCount = await AiGenerationJobRepository.reconcileStuckJobs(15, mockDb);

        expect(updateTable).toHaveBeenCalledWith('ai_generation_jobs');
        expect(whereFirst).toHaveBeenCalledWith('status', 'in', ['queued', 'processing']);
        expect(updatedCount).toBe(3);
    });

    it('purges expired jobs older than expires_at', async () => {
        const executeTakeFirst = vi.fn().mockResolvedValue({ numDeletedRows: 5n });
        const where = vi.fn().mockReturnValue({ executeTakeFirst });
        const deleteFrom = vi.fn().mockReturnValue({ where });

        const mockDb = { deleteFrom } as unknown as DbClient;

        const deletedCount = await AiGenerationJobRepository.purgeExpiredJobs(mockDb);

        expect(deleteFrom).toHaveBeenCalledWith('ai_generation_jobs');
        expect(deletedCount).toBe(5);
    });

    it('finds expired jobs whose TTL has passed', async () => {
        const mockRows = [
            {
                id: 'expired-1',
                user_id: 'user-1',
                institution_id: 'inst-1',
                status: 'queued',
                progress: 0,
                current_step: 'Queued',
                config: mockConfig,
                result: null,
                error: null,
                storage_bucket: 'ai-generation-staging',
                storage_paths: [
                    {
                        path: 'expired-1/001-doc.pdf',
                        originalName: 'doc.pdf',
                        contentType: 'application/pdf',
                        sizeBytes: 100,
                    },
                ],
                expires_at: new Date(Date.now() - 3600000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ];

        const execute = vi.fn().mockResolvedValue(mockRows);
        const limit = vi.fn().mockReturnValue({ execute });
        const selectAll = vi.fn().mockReturnValue({ execute, limit });
        const where = vi.fn().mockReturnValue({ selectAll });
        const selectFrom = vi.fn().mockReturnValue({ where });

        const mockDb = { selectFrom } as unknown as DbClient;

        const expired = await AiGenerationJobRepository.getExpiredJobs({ limit: 10, db: mockDb });

        expect(selectFrom).toHaveBeenCalledWith('ai_generation_jobs');
        expect(where).toHaveBeenCalledWith('expires_at', '<', expect.any(Date));
        expect(limit).toHaveBeenCalledWith(10);
        expect(expired).toHaveLength(1);
        expect(expired[0].id).toBe('expired-1');
        expect(expired[0].storage_bucket).toBe('ai-generation-staging');
    });

    it('deletes a single generation job by id', async () => {
        const executeTakeFirst = vi.fn().mockResolvedValue({ numDeletedRows: 1n });
        const where = vi.fn().mockReturnValue({ executeTakeFirst });
        const deleteFrom = vi.fn().mockReturnValue({ where });

        const mockDb = { deleteFrom } as unknown as DbClient;

        const deleted = await AiGenerationJobRepository.deleteJob('job-to-delete', mockDb);

        expect(deleteFrom).toHaveBeenCalledWith('ai_generation_jobs');
        expect(where).toHaveBeenCalledWith('id', '=', 'job-to-delete');
        expect(deleted).toBe(true);
    });
});
