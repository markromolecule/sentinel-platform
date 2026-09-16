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
import {
    AiGenerationInputStorageService,
    type AiGenerationInputManifest,
} from '../services/ai-generation-input-storage.service';
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
            content: {
                'application/json': {
                    schema: generatePreviewJobResponseSchema,
                },
            },
            description: 'AI question generation job accepted and queued',
        },
        400: { description: 'Bad Request' },
        413: { description: 'Payload Too Large' },
        500: { description: 'Internal Server Error' },
        503: { description: 'Service Unavailable' },
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

    // 1. Stage files to private Supabase Storage
    let manifest: AiGenerationInputManifest;
    try {
        manifest = await AiGenerationInputStorageService.uploadJobInputs({
            jobId,
            files,
        });
    } catch (uploadErr) {
        console.error(
            `[AiGeneration] [${jobId}] Failed to upload input files to storage:`,
            uploadErr instanceof Error ? uploadErr.message : uploadErr,
        );
        throw new HTTPException(503, {
            message:
                'AI generation storage service is temporarily unavailable. Please try again shortly.',
        });
    }

    // 2. Create DB tracking record with storage manifest
    let jobRecord;
    try {
        jobRecord = await AiGenerationJobRepository.createJob(
            {
                id: jobId,
                userId,
                institutionId: institutionId ?? null,
                config: effectiveConfig,
                storageBucket: manifest.bucket,
                storagePaths: manifest.objects,
                ttlHours: 24,
            },
            c.get('dbClient'),
        );
    } catch (dbErr) {
        console.error(
            `[AiGeneration] [${jobId}] Failed to create DB tracking record:`,
            dbErr instanceof Error ? dbErr.message : dbErr,
        );
        await AiGenerationInputStorageService.deleteManifest(manifest).catch((delErr) => {
            console.error(
                `[AiGeneration] [${jobId}] Failed to rollback storage objects after DB error:`,
                delErr instanceof Error ? delErr.message : delErr,
            );
        });
        throw dbErr;
    }

    // 3. Enqueue to BullMQ / dev runner
    try {
        await AiGenerationQueueService.enqueueJob({
            jobId,
            userId,
            institutionId: institutionId ?? null,
            config: effectiveConfig,
            storageBucket: manifest.bucket,
            storagePaths: manifest.objects,
        });
    } catch (queueErr) {
        console.error(
            `[AiGeneration] [${jobId}] Failed to enqueue job:`,
            queueErr instanceof Error ? queueErr.message : queueErr,
        );
        await AiGenerationJobRepository.failJob({
            id: jobId,
            error:
                queueErr instanceof Error
                    ? queueErr.message
                    : 'Failed to enqueue AI generation task',
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
