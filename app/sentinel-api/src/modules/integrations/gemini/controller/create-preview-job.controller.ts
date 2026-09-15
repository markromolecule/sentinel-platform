import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    parseGenerateQuestionPreviewMultipartBody,
    resolvePdfFilesFromMultipartBody,
} from '../../../../lib/gemini/services/question-generator';
import { requireActivePermission } from '../../../../lib/permissions';
import {
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import {
    generatePreviewJobResponseSchema,
    generatePreviewMultipartSchema,
} from '../gemini.dto';
import { AiJobFileStagingService } from '../services/ai-job-file-staging.service';
import { AiGenerationQueueService } from '../queue/ai-generation-queue.service';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';

export const MAX_TOTAL_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15MB Vertex AI ceiling

export const createGeneratePreviewJobRoute = createRoute({
    method: 'post',
    path: '/generate-preview/jobs',
    tags: ['AI'],
    summary: 'Create an asynchronous AI question generation job',
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: generatePreviewMultipartSchema,
                },
            },
        },
    },
    responses: {
        202: {
            description: 'AI question generation job accepted and queued',
            content: {
                'application/json': {
                    schema: generatePreviewJobResponseSchema,
                },
            },
        },
    },
});

export const createGeneratePreviewJobRouteHandler: AppRouteHandler<
    typeof createGeneratePreviewJobRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const dbUser = c.get('user');
    const userId = dbUser?.id ?? supabaseUser?.sub;

    if (!userId) {
        throw new HTTPException(401, { message: 'Authentication required' });
    }

    requireActivePermission(
        c,
        ['ai:generate_questions', 'assessments:manage'],
        'Forbidden. Insufficient permissions.',
    );

    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId,
        claimedRole: c.get('role') || supabaseUser?.user_metadata?.role,
    });

    const multipartBody = (await c.req.parseBody({
        all: true,
    })) as Record<string, string | File | (string | File)[]>;
    const files = resolvePdfFilesFromMultipartBody(multipartBody);

    if (files.length === 0) {
        throw new HTTPException(400, {
            message: 'No PDF files were provided for question generation.',
        });
    }

    const totalBytes = files.reduce((acc, file) => acc + (file.size || 0), 0);
    if (totalBytes > MAX_TOTAL_PDF_SIZE_BYTES) {
        throw new HTTPException(413, {
            message:
                'Total PDF payload exceeds 15MB limit for inline Vertex AI generation. Please split your documents or reduce file size.',
        });
    }

    const parsedConfig = parseGenerateQuestionPreviewMultipartBody(multipartBody);
    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: parsedConfig.institutionId,
    });

    const effectiveConfig = {
        ...parsedConfig,
        institutionId: institutionId ?? undefined,
    };

    const jobId = crypto.randomUUID();

    // 1. Stage files on local disk
    await AiJobFileStagingService.stageUploadedFiles(jobId, files);

    // 2. Create DB tracking record
    let jobRecord;
    try {
        jobRecord = await AiGenerationJobRepository.createJob(
            {
                id: jobId,
                userId,
                institutionId: institutionId ?? null,
                config: effectiveConfig,
                ttlHours: 24,
            },
            c.get('dbClient'),
        );
    } catch (dbErr) {
        await AiJobFileStagingService.cleanupJobFiles(jobId).catch(() => { });
        throw dbErr;
    }

    // 3. Enqueue to BullMQ / dev runner
    try {
        await AiGenerationQueueService.enqueueJob({
            jobId,
            userId,
            institutionId: institutionId ?? null,
            config: effectiveConfig,
        });
    } catch (queueErr) {
        await AiJobFileStagingService.cleanupJobFiles(jobId).catch(() => { });
        await AiGenerationJobRepository.failJob({
            id: jobId,
            error: queueErr instanceof Error ? queueErr.message : 'Failed to enqueue job',
            db: c.get('dbClient'),
        }).catch(() => { });
        throw queueErr;
    }

    return c.json(
        {
            success: true as const,
            data: {
                jobId: jobRecord.id,
                status: jobRecord.status,
                createdAt: jobRecord.created_at.toISOString(),
            },
        },
        202,
    );
};
