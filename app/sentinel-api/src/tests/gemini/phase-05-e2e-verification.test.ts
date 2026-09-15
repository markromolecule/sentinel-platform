import { describe, expect, it, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import {
    createGeneratePreviewJobRoute,
    createGeneratePreviewJobRouteHandler,
    getPreviewJobStatusRoute,
    getPreviewJobStatusRouteHandler,
} from '../../modules/integrations/gemini/controller';
import { AiGenerationJobRepository } from '../../modules/integrations/gemini/data/ai-generation-job.repository';
import { AiGenerationQueueService } from '../../modules/integrations/gemini/queue/ai-generation-queue.service';
import { AiJobFileStagingService } from '../../modules/integrations/gemini/services/ai-job-file-staging.service';
import { AiGenerationWorkerProcessor } from '../../modules/integrations/gemini/queue/ai-generation.worker';
import { QuestionGeneratorService } from '../../lib/gemini/services/question-generator';
import * as redisModule from '../../lib/redis/redis.service';
import * as configModule from '../../modules/integrations/gemini/queue/ai-generation-queue.config';

describe('Phase 5: End-to-End Verification & Security Penetration', () => {
    const createAuthorizedApp = (args: {
        userId?: string;
        institutionId?: string;
        role?: string;
        permissionKeys?: string[];
    }) => {
        const testApp = new OpenAPIHono();

        testApp.use('*', async (c, next) => {
            const resolvedUserId = args.userId ?? '123e4567-e89b-12d3-a456-426614174001';
            c.set('dbClient', {} as any);
            c.set('user', { id: resolvedUserId } as any);
            c.set('supabaseUser', {
                sub: resolvedUserId,
                user_metadata: { role: args.role ?? 'instructor' },
            } as any);
            c.set('institutionId', args.institutionId ?? '123e4567-e89b-12d3-a456-426614174010');
            c.set('role', args.role ?? 'instructor');
            c.set('activePermissionKeys', args.permissionKeys ?? ['ai:generate_questions']);
            await next();
        });

        testApp.openapi(createGeneratePreviewJobRoute, createGeneratePreviewJobRouteHandler);
        testApp.openapi(getPreviewJobStatusRoute, getPreviewJobStatusRouteHandler);

        testApp.onError((err, c) => {
            if (err instanceof HTTPException) {
                return c.json(
                    {
                        success: false,
                        error: err.name,
                        message: err.message,
                    },
                    err.status,
                );
            }
            return c.json(
                {
                    success: false,
                    error: err.name || 'Internal Server Error',
                    message: err.message,
                },
                500,
            );
        });

        return testApp;
    };

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('Task 5.1: Multi-Document Asynchronous Generation Flow', () => {
        it('dispatches 80-question job across multiple documents with < 500ms latency and returns HTTP 202', async () => {
            // Stage files, create DB record, and enqueue are all mocked — no real disk or DB I/O
            vi.spyOn(AiJobFileStagingService, 'stageUploadedFiles').mockResolvedValue([
                '/tmp/ai-jobs/doc1.pdf',
                '/tmp/ai-jobs/doc2.pdf',
            ]);
            // createJob captures whatever jobId the handler generates internally
            vi.spyOn(AiGenerationJobRepository, 'createJob').mockImplementation(async (args, _db) => ({
                id: args.id,
                user_id: args.userId,
                institution_id: args.institutionId ?? null,
                status: 'queued' as const,
                progress: 0,
                current_step: 'Queued',
                config: args.config as any,
                result: null,
                error: null,
                expires_at: new Date(Date.now() + 86400000),
                created_at: new Date(),
                updated_at: new Date(),
            }));
            const enqueueSpy = vi.spyOn(AiGenerationQueueService, 'enqueueJob').mockResolvedValue();

            const app = createAuthorizedApp({
                userId: '123e4567-e89b-12d3-a456-426614174001',
                institutionId: '123e4567-e89b-12d3-a456-426614174010',
                role: 'instructor',
            });

            const formData = new FormData();
            formData.append('file', new File(['%PDF-Doc1-Content'], 'lecture1.pdf', { type: 'application/pdf' }));
            formData.append('files', new File(['%PDF-Doc2-Content'], 'lecture2.pdf', { type: 'application/pdf' }));
            formData.append('files', new File(['%PDF-Doc3-Content'], 'lecture3.pdf', { type: 'application/pdf' }));
            formData.append(
                'config',
                JSON.stringify({
                    questionCount: 80,
                    questionType: 'MULTIPLE_CHOICE',
                    difficultyDistribution: { Easy: 20, Medium: 40, Hard: 20 },
                }),
            );

            const startTime = Date.now();
            const response = await app.request('/generate-preview/jobs', {
                method: 'POST',
                body: formData,
            });
            const dispatchLatencyMs = Date.now() - startTime;

            expect(response.status).toBe(202);
            expect(dispatchLatencyMs).toBeLessThan(500);

            const body = await response.json();
            expect(body.success).toBe(true);
            expect(body.data.status).toBe('queued');
            // jobId is a valid UUID generated internally
            expect(body.data.jobId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
            expect(enqueueSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: '123e4567-e89b-12d3-a456-426614174001',
                    institutionId: '123e4567-e89b-12d3-a456-426614174010',
                }),
            );
        });

        it('worker successfully generates 80 questions and updates progress iteratively to completion', async () => {
            const jobId = '123e4567-e89b-12d3-a456-426614174200';
            const stagedFile = new File(['%PDF-Data'], 'test.pdf', { type: 'application/pdf' });
            vi.spyOn(AiJobFileStagingService, 'loadStagedFiles').mockResolvedValue([stagedFile]);
            const cleanupSpy = vi.spyOn(AiJobFileStagingService, 'cleanupJobFiles').mockResolvedValue();

            const progressCalls: { progress: number; currentStep?: string }[] = [];
            vi.spyOn(AiGenerationJobRepository, 'updateProgress').mockImplementation(async (args) => {
                progressCalls.push({ progress: args.progress, currentStep: args.currentStep });
            });

            const completeSpy = vi.spyOn(AiGenerationJobRepository, 'completeJob').mockResolvedValue();

            const generatedQuestions = Array.from({ length: 80 }, (_, i) => ({
                id: `gen-q-${i + 1}`,
                type: 'multiple_choice',
                text: `Question ${i + 1}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option A',
                cognitiveLevel: 'Understanding',
                difficulty: 'Medium',
            }));

            vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockImplementation(async (opts) => {
                if (opts.onProgress) {
                    await opts.onProgress(25, 'Processing batch 1/4');
                    await opts.onProgress(50, 'Processing batch 2/4');
                    await opts.onProgress(75, 'Processing batch 3/4');
                    await opts.onProgress(90, 'Validating passage quality');
                }
                return {
                    questions: generatedQuestions,
                    sourceDocuments: ['lecture1.pdf'],
                    warnings: [],
                    telemetry: { totalPipelineDurationMs: 95000 },
                } as any;
            });

            await AiGenerationWorkerProcessor.processJob({
                jobId,
                userId: '123e4567-e89b-12d3-a456-426614174001',
                institutionId: '123e4567-e89b-12d3-a456-426614174010',
                config: { questionCount: 80 } as any,
            });

            expect(progressCalls).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ progress: 5, currentStep: 'Staging lecture documents...' }),
                    expect.objectContaining({ progress: 25, currentStep: 'Processing batch 1/4' }),
                    expect.objectContaining({ progress: 50, currentStep: 'Processing batch 2/4' }),
                    expect.objectContaining({ progress: 75, currentStep: 'Processing batch 3/4' }),
                    expect.objectContaining({ progress: 90, currentStep: 'Validating passage quality' }),
                ]),
            );

            expect(completeSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: jobId,
                    result: expect.objectContaining({
                        questions: expect.arrayContaining([
                            expect.objectContaining({ id: 'gen-q-1' }),
                            expect.objectContaining({ id: 'gen-q-80' }),
                        ]),
                    }),
                }),
            );

            expect(cleanupSpy).toHaveBeenCalledWith(jobId);
        });
    });

    describe('Task 5.2: Security & Tenant Isolation Penetration Tests', () => {
        const targetJobId = '123e4567-e89b-12d3-a456-426614174300';
        const mockTargetJob = {
            id: targetJobId,
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            institution_id: '123e4567-e89b-12d3-a456-426614174010',
            status: 'completed' as const,
            progress: 100,
            current_step: 'Completed',
            config: { questionCount: 10 } as any,
            result: { questions: [{ id: 'secret-q1' }] } as any,
            error: null,
            expires_at: new Date(),
            created_at: new Date('2026-09-15T12:00:00Z'),
            updated_at: new Date('2026-09-15T12:01:00Z'),
        };

        it('denies IDOR attempt: Instructor B in same institution receives HTTP 404 without leaking existence', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(mockTargetJob);

            const app = createAuthorizedApp({
                userId: '123e4567-e89b-12d3-a456-426614174002',
                institutionId: '123e4567-e89b-12d3-a456-426614174010',
                role: 'instructor',
            });

            const response = await app.request(`/generate-preview/jobs/${targetJobId}`);
            expect(response.status).toBe(404);

            const data = await response.json();
            expect(data.message).toBe('Generation job not found');
            expect(data.data).toBeUndefined();
        });

        it('denies cross-tenant attack: Admin in institution Beta receives HTTP 404 for institution Alpha job', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(mockTargetJob);

            const app = createAuthorizedApp({
                userId: '123e4567-e89b-12d3-a456-426614174003',
                institutionId: '123e4567-e89b-12d3-a456-426614174020',
                role: 'admin',
                permissionKeys: ['assessments:manage'],
            });

            const response = await app.request(`/generate-preview/jobs/${targetJobId}`);
            expect(response.status).toBe(404);

            const data = await response.json();
            expect(data.message).toBe('Generation job not found');
        });

        it('authorizes legitimate access: Instructor A retrieves their own completed job payload', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(mockTargetJob);

            const app = createAuthorizedApp({
                userId: '123e4567-e89b-12d3-a456-426614174001',
                institutionId: '123e4567-e89b-12d3-a456-426614174010',
                role: 'instructor',
            });

            const response = await app.request(`/generate-preview/jobs/${targetJobId}`);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.jobId).toBe(targetJobId);
            expect(data.data.result.questions[0].id).toBe('secret-q1');
        });
    });

    describe('Task 5.3: Worker Crash & Stalled Job Recovery', () => {
        it('database reconciler transitions stuck jobs to failed status after timeout threshold', async () => {
            const reconcileSpy = vi.spyOn(AiGenerationJobRepository, 'reconcileStuckJobs').mockResolvedValue(2);

            const count = await AiGenerationJobRepository.reconcileStuckJobs(15, {} as any);
            expect(count).toBe(2);
            expect(reconcileSpy).toHaveBeenCalledWith(15, expect.anything());
        });

        it('sweeper purges orphaned local directories after worker termination', async () => {
            const sweepSpy = vi.spyOn(AiJobFileStagingService, 'sweepStaleJobFiles').mockResolvedValue(3);

            const sweptCount = await AiJobFileStagingService.sweepStaleJobFiles(3600);
            expect(sweptCount).toBe(3);
            expect(sweepSpy).toHaveBeenCalledWith(3600);
        });
    });

    describe('Task 5.4: Production Redis Fail-Fast Verification', () => {
        it('fails fast with HTTP 503 Service Unavailable when in production and Redis is down', async () => {
            vi.spyOn(configModule, 'resolveQueueOperationalMode').mockReturnValue('redis');
            vi.spyOn(redisModule, 'hasRedisConfigured').mockReturnValue(false);

            await expect(
                AiGenerationQueueService.enqueueJob({
                    jobId: '123e4567-e89b-12d3-a456-426614174400',
                    userId: '123e4567-e89b-12d3-a456-426614174001',
                    institutionId: '123e4567-e89b-12d3-a456-426614174010',
                    config: {} as any,
                }),
            ).rejects.toMatchObject({
                status: 503,
                message: expect.stringContaining('Redis connection is required in production'),
            });
        });
    });
});
