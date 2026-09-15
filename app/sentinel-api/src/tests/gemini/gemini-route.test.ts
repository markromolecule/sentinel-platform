import { z } from '@hono/zod-openapi';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import app from '../../app';
import {
    createGeneratePreviewJobRoute,
    createGeneratePreviewJobRouteHandler,
    generatePreviewRoute,
    generatePreviewRouteHandler,
    getPreviewJobStatusRoute,
    getPreviewJobStatusRouteHandler,
    legacyGenerateReviewRoute,
} from '../../modules/integrations/gemini/controller';
import { QuestionGeneratorService } from '../../lib/gemini/services/question-generator';
import { LogsService } from '../../modules/general/logs/logs.service';
import { AiJobFileStagingService } from '../../modules/integrations/gemini/services/ai-job-file-staging.service';
import { AiGenerationQueueService } from '../../modules/integrations/gemini/queue/ai-generation-queue.service';
import { AiGenerationJobRepository } from '../../modules/integrations/gemini/data/ai-generation-job.repository';

describe('Gemini AI routes', () => {
    const createAuthorizedApp = (
        args: {
            permissionKeys: string[];
            role?: string;
            userId?: string;
            institutionId?: string;
        } = {
            permissionKeys: [],
            role: 'support',
        },
    ) => {
        const testApp = new OpenAPIHono();

        testApp.use(
            '*',
            cors({
                origin: (origin) => (origin === 'https://app.sentinelph.tech' ? origin : null),
                credentials: true,
                allowHeaders: ['Content-Type', 'Authorization'],
            }),
        );

        testApp.use('*', async (c, next) => {
            const resolvedUserId = args.userId ?? 'user-1';
            c.set('dbClient', {} as any);
            c.set('user', { id: resolvedUserId } as any);
            c.set('supabaseUser', {
                sub: resolvedUserId,
                user_metadata: {
                    role: args.role ?? 'support',
                },
            } as any);
            c.set('institutionId', args.institutionId ?? 'institution-1');
            c.set('role', args.role ?? 'support');
            c.set('activePermissionKeys', args.permissionKeys);
            await next();
        });

        testApp.openapi(generatePreviewRoute, generatePreviewRouteHandler);
        testApp.openapi(legacyGenerateReviewRoute, generatePreviewRouteHandler);
        testApp.openapi(createGeneratePreviewJobRoute, createGeneratePreviewJobRouteHandler);
        testApp.openapi(getPreviewJobStatusRoute, getPreviewJobStatusRouteHandler);
        testApp.onError((err, c) => {
            const origin = c.req.header('Origin');
            if (origin === 'https://app.sentinelph.tech') {
                c.header('Access-Control-Allow-Origin', origin);
                c.header('Access-Control-Allow-Credentials', 'true');
                c.header('Vary', 'Origin');
            }

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

    it.each(['/ai/generate-preview', '/ai/generate-review'])(
        'keeps %s registered behind auth',
        async (path) => {
            const response = await app.request(path, {
                method: 'POST',
            });

            expect(response.status).toBe(401);
            await expect(response.json()).resolves.toMatchObject({
                message: 'Missing auth token',
            });
        },
    );

    it.each(['/ai/generate-preview', '/ai/generate-review'])(
        'allows %s for callers with ai:generate_questions',
        async (path) => {
            const generateSpy = vi
                .spyOn(QuestionGeneratorService, 'generatePreviewFromPdf')
                .mockResolvedValue({
                    target: 'QUESTION_BANK',
                } as any);
            const logSpy = vi.spyOn(LogsService, 'createLog').mockResolvedValue(undefined as any);

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'support',
            });
            const formData = new FormData();
            formData.append(
                'file',
                new File(['%PDF-1.4 test'], 'lesson.pdf', {
                    type: 'application/pdf',
                }),
            );
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionCount: 1,
                    questionTypeDistribution: [{ type: 'MULTIPLE_CHOICE', count: 1 }],
                }),
            );

            const response = await testApp.request(path.replace('/ai', ''), {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(200);
            expect(generateSpy).toHaveBeenCalledTimes(1);
            expect(logSpy).toHaveBeenCalledTimes(1);
        },
    );

    it.each(['/ai/generate-preview', '/ai/generate-review'])(
        'allows %s for callers with assessments:manage',
        async (path) => {
            const generateSpy = vi
                .spyOn(QuestionGeneratorService, 'generatePreviewFromPdf')
                .mockResolvedValue({
                    target: 'QUESTION_BANK',
                } as any);
            const logSpy = vi.spyOn(LogsService, 'createLog').mockResolvedValue(undefined as any);

            const testApp = createAuthorizedApp({
                permissionKeys: ['assessments:manage'],
                role: 'instructor',
            });
            const formData = new FormData();
            formData.append(
                'file',
                new File(['%PDF-1.4 test'], 'lesson.pdf', {
                    type: 'application/pdf',
                }),
            );
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionCount: 1,
                    questionTypeDistribution: [{ type: 'MULTIPLE_CHOICE', count: 1 }],
                }),
            );

            const response = await testApp.request(path.replace('/ai', ''), {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(200);
            expect(generateSpy).toHaveBeenCalledTimes(1);
            expect(logSpy).toHaveBeenCalledTimes(1);
        },
    );

    it.each(['/ai/generate-preview', '/ai/generate-review'])(
        'returns 403 when callers have neither ai:generate_questions nor assessments:manage on %s',
        async (path) => {
            const generateSpy = vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf');

            const testApp = createAuthorizedApp({
                permissionKeys: [],
                role: 'student',
            });
            const formData = new FormData();
            formData.append(
                'file',
                new File(['%PDF-1.4 test'], 'lesson.pdf', {
                    type: 'application/pdf',
                }),
            );
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionCount: 1,
                    questionTypeDistribution: [{ type: 'MULTIPLE_CHOICE', count: 1 }],
                }),
            );

            const response = await testApp.request(path.replace('/ai', ''), {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(403);
            expect(generateSpy).not.toHaveBeenCalled();
        },
    );

    it('returns 502 with quality validation message when upstream generation fails', async () => {
        vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockRejectedValue(
            new HTTPException(502, {
                message:
                    'AI passage generation did not meet quality checks. The questions could not be generated without leaking answers.',
            }),
        );

        const testApp = createAuthorizedApp({
            permissionKeys: ['ai:generate_questions'],
            role: 'instructor',
        });
        const formData = new FormData();
        formData.append(
            'file',
            new File(['%PDF-1.4 test'], 'lesson.pdf', {
                type: 'application/pdf',
            }),
        );
        formData.append(
            'config',
            JSON.stringify({
                target: 'QUESTION_BANK',
                questionCount: 1,
                questionTypeDistribution: [{ type: 'MULTIPLE_CHOICE', count: 1 }],
            }),
        );

        const response = await testApp.request('/generate-preview', {
            method: 'POST',
            body: formData,
        });

        expect(response.status).toBe(502);
        const text = await response.text();
        expect(text).toContain('AI passage generation did not meet quality checks');
    });

    it.each(['/ai/generate-preview', '/ai/generate-review'])(
        'returns a JSON 502 with CORS headers for %s when preview generation fails upstream',
        async (path) => {
            vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockRejectedValue(
                new HTTPException(502, {
                    message: 'Gemini request timed out or failed to connect.',
                }),
            );

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'instructor',
            });
            const formData = new FormData();
            formData.append(
                'file',
                new File(['%PDF-1.4 test'], 'lesson.pdf', {
                    type: 'application/pdf',
                }),
            );
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionCount: 1,
                    questionTypeDistribution: [{ type: 'MULTIPLE_CHOICE', count: 1 }],
                }),
            );

            const response = await testApp.request(path.replace('/ai', ''), {
                method: 'POST',
                body: formData,
                headers: {
                    Origin: 'https://app.sentinelph.tech',
                },
            });

            expect(response.status).toBe(502);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
                'https://app.sentinelph.tech',
            );
            expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');

            const payload = await response.json();
            expect(payload).toMatchObject({
                success: false,
                message: 'Gemini request timed out or failed to connect.',
            });
        },
    );

    describe('Legacy Synchronous Gating (POST /generate-preview)', () => {
        it('rejects requests with >10 questions with HTTP 400', async () => {
            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'instructor',
            });
            const formData = new FormData();
            formData.append(
                'file',
                new File(['%PDF-1.4 test'], 'lesson.pdf', { type: 'application/pdf' }),
            );
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionType: 'MULTIPLE_CHOICE',
                    questionCount: 15,
                }),
            );

            const response = await testApp.request('/generate-preview', {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(400);
            const payload = await response.json();
            expect(payload.message).toContain('must use the asynchronous endpoint POST /ai/generate-preview/jobs');
        });

        it('rejects requests with multiple PDF files with HTTP 400', async () => {
            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'instructor',
            });
            const formData = new FormData();
            formData.append(
                'file',
                new File(['%PDF-1.4 test 1'], 'lesson1.pdf', { type: 'application/pdf' }),
            );
            formData.append(
                'file',
                new File(['%PDF-1.4 test 2'], 'lesson2.pdf', { type: 'application/pdf' }),
            );
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionType: 'MULTIPLE_CHOICE',
                    questionCount: 5,
                }),
            );

            const response = await testApp.request('/generate-preview', {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(400);
            const payload = await response.json();
            expect(payload.message).toContain('must use the asynchronous endpoint POST /ai/generate-preview/jobs');
        });
    });

    describe('Asynchronous Job Creation (POST /generate-preview/jobs)', () => {
        it('keeps /ai/generate-preview/jobs registered behind auth', async () => {
            const response = await app.request('/ai/generate-preview/jobs', {
                method: 'POST',
            });

            expect(response.status).toBe(401);
            await expect(response.json()).resolves.toMatchObject({
                message: 'Missing auth token',
            });
        });

        it('accepts valid multipart payload and returns HTTP 202 in < 500ms', async () => {
            const stageSpy = vi
                .spyOn(AiJobFileStagingService, 'stageUploadedFiles')
                .mockResolvedValue(['/tmp/ai-jobs/job-1/lesson.pdf']);
            const createJobSpy = vi
                .spyOn(AiGenerationJobRepository, 'createJob')
                .mockResolvedValue({
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    user_id: 'user-1',
                    institution_id: 'institution-1',
                    status: 'queued',
                    progress: 0,
                    current_step: 'Queued',
                    config: { target: 'QUESTION_BANK', questionType: 'MULTIPLE_CHOICE', questionCount: 80 } as any,
                    result: null,
                    error: null,
                    expires_at: new Date(),
                    created_at: new Date('2026-09-15T12:00:00Z'),
                    updated_at: new Date('2026-09-15T12:00:00Z'),
                });
            const enqueueSpy = vi
                .spyOn(AiGenerationQueueService, 'enqueueJob')
                .mockResolvedValue(undefined as any);

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'instructor',
            });
            const formData = new FormData();
            formData.append(
                'file',
                new File(['%PDF-1.4 large lecture'], 'lecture.pdf', {
                    type: 'application/pdf',
                }),
            );
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionType: 'MULTIPLE_CHOICE',
                    questionCount: 80,
                }),
            );

            const startTime = Date.now();
            const response = await testApp.request('/generate-preview/jobs', {
                method: 'POST',
                body: formData,
            });
            const elapsed = Date.now() - startTime;

            expect(elapsed).toBeLessThan(500);
            expect(response.status).toBe(202);
            expect(stageSpy).toHaveBeenCalledTimes(1);
            expect(createJobSpy).toHaveBeenCalledTimes(1);
            expect(enqueueSpy).toHaveBeenCalledTimes(1);

            const payload = await response.json();
            expect(payload).toEqual({
                success: true,
                data: {
                    jobId: '123e4567-e89b-12d3-a456-426614174000',
                    status: 'queued',
                    createdAt: '2026-09-15T12:00:00.000Z',
                },
            });
        });

        it('rejects payloads exceeding 15MB total file size with HTTP 413', async () => {
            const stageSpy = vi.spyOn(AiJobFileStagingService, 'stageUploadedFiles');

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'instructor',
            });
            const formData = new FormData();
            // 16MB PDF file payload
            const oversizedFile = new File([new Uint8Array(16 * 1024 * 1024)], 'oversized.pdf', {
                type: 'application/pdf',
            });
            formData.append('file', oversizedFile);
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionType: 'MULTIPLE_CHOICE',
                    questionCount: 20,
                }),
            );

            const response = await testApp.request('/generate-preview/jobs', {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(413);
            const payload = await response.json();
            expect(payload.message).toContain('Total PDF payload exceeds 15MB limit');
            expect(stageSpy).not.toHaveBeenCalled();
        });

        it('rejects when no files are uploaded with HTTP 400', async () => {
            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'instructor',
            });
            const formData = new FormData();
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionType: 'MULTIPLE_CHOICE',
                    questionCount: 20,
                }),
            );

            const response = await testApp.request('/generate-preview/jobs', {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(400);
            const payload = await response.json();
            expect(payload.message).toContain('A PDF file is required');
        });

        it('cleans up disk and marks job failed when queue dispatch errors', async () => {
            vi.spyOn(crypto, 'randomUUID').mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
            vi.spyOn(AiJobFileStagingService, 'stageUploadedFiles').mockResolvedValue(['/tmp/path']);
            const cleanupSpy = vi
                .spyOn(AiJobFileStagingService, 'cleanupJobFiles')
                .mockResolvedValue(undefined);
            vi.spyOn(AiGenerationJobRepository, 'createJob').mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174000',
                user_id: 'user-1',
                institution_id: 'institution-1',
                status: 'queued',
                progress: 0,
                current_step: 'Queued',
                config: { target: 'QUESTION_BANK', questionType: 'MULTIPLE_CHOICE', questionCount: 1 } as any,
                result: null,
                error: null,
                expires_at: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });
            const failSpy = vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue({} as any);
            vi.spyOn(AiGenerationQueueService, 'enqueueJob').mockRejectedValue(
                new HTTPException(503, {
                    message: 'AI generation queue service is temporarily unavailable.',
                }),
            );

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                role: 'instructor',
            });
            const formData = new FormData();
            formData.append('file', new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' }));
            formData.append(
                'config',
                JSON.stringify({
                    target: 'QUESTION_BANK',
                    questionType: 'MULTIPLE_CHOICE',
                    questionCount: 1,
                }),
            );

            const response = await testApp.request('/generate-preview/jobs', {
                method: 'POST',
                body: formData,
            });

            expect(response.status).toBe(503);
            expect(cleanupSpy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
            expect(failSpy).toHaveBeenCalledWith({
                id: '123e4567-e89b-12d3-a456-426614174000',
                error: expect.stringContaining('unavailable'),
                db: expect.anything(),
            });
        });
    });


    describe('Job Status & Result Retrieval (GET /generate-preview/jobs/:id)', () => {
        const mockJobRecord = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: 'owner-user',
            institution_id: 'institution-1',
            status: 'completed' as const,
            progress: 100,
            current_step: 'Generation completed successfully.',
            config: { target: 'QUESTION_BANK', questionCount: 10 } as any,
            result: { target: 'QUESTION_BANK', questions: [] } as any,
            error: null,
            expires_at: new Date(),
            created_at: new Date('2026-09-15T12:00:00Z'),
            updated_at: new Date('2026-09-15T12:02:00Z'),
        };

        it('returns HTTP 404 when job does not exist in database', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(null);

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                userId: 'owner-user',
                role: 'instructor',
            });

            const response = await testApp.request(
                '/generate-preview/jobs/123e4567-e89b-12d3-a456-426614174000',
            );

            expect(response.status).toBe(404);
            const payload = await response.json();
            expect(payload.message).toBe('Generation job not found');
        });

        it('returns HTTP 404 on IDOR attempt by a different instructor in same institution', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(mockJobRecord);

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                userId: 'intruder-user',
                role: 'instructor',
                institutionId: 'institution-1',
            });

            const response = await testApp.request(
                '/generate-preview/jobs/123e4567-e89b-12d3-a456-426614174000',
            );

            expect(response.status).toBe(404);
            const payload = await response.json();
            expect(payload.message).toBe('Generation job not found');
        });

        it('returns HTTP 200 with job details when requested by the owning instructor', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(mockJobRecord);

            const testApp = createAuthorizedApp({
                permissionKeys: ['ai:generate_questions'],
                userId: 'owner-user',
                role: 'instructor',
                institutionId: 'institution-1',
            });

            const response = await testApp.request(
                '/generate-preview/jobs/123e4567-e89b-12d3-a456-426614174000',
            );

            expect(response.status).toBe(200);
            const payload = await response.json();
            expect(payload).toEqual({
                success: true,
                data: {
                    jobId: '123e4567-e89b-12d3-a456-426614174000',
                    status: 'completed',
                    progress: 100,
                    currentStep: 'Generation completed successfully.',
                    result: { target: 'QUESTION_BANK', questions: [] },
                    error: null,
                    createdAt: '2026-09-15T12:00:00.000Z',
                    updatedAt: '2026-09-15T12:02:00.000Z',
                },
            });
        });

        it('returns HTTP 200 when requested by an admin in the same institution', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(mockJobRecord);

            const testApp = createAuthorizedApp({
                permissionKeys: ['assessments:manage'],
                userId: 'admin-user',
                role: 'admin',
                institutionId: 'institution-1',
            });

            const response = await testApp.request(
                '/generate-preview/jobs/123e4567-e89b-12d3-a456-426614174000',
            );

            expect(response.status).toBe(200);
            const payload = await response.json();
            expect(payload.data.jobId).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        it('returns HTTP 404 when requested by an admin from a different institution', async () => {
            vi.spyOn(AiGenerationJobRepository, 'getJobById').mockResolvedValue(mockJobRecord);

            const testApp = createAuthorizedApp({
                permissionKeys: ['assessments:manage'],
                userId: 'admin-user-other-inst',
                role: 'admin',
                institutionId: 'different-institution',
            });

            const response = await testApp.request(
                '/generate-preview/jobs/123e4567-e89b-12d3-a456-426614174000',
            );

            expect(response.status).toBe(404);
            const payload = await response.json();
            expect(payload.message).toBe('Generation job not found');
        });
    });
});

