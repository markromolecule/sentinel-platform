import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { resolveAssessmentActorRole } from '../../../examination/assessment/assessment-access';
import {
    getPreviewJobParamSchema,
    getPreviewJobStatusResponseSchema,
} from '../gemini.dto';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';

export const getPreviewJobStatusRoute = createRoute({
    method: 'get',
    path: '/generate-preview/jobs/{id}',
    tags: ['AI'],
    summary: 'Get status and result of an asynchronous AI question generation job',
    request: {
        params: getPreviewJobParamSchema,
    },
    responses: {
        200: {
            description: 'Job status retrieved successfully',
            content: {
                'application/json': {
                    schema: getPreviewJobStatusResponseSchema,
                },
            },
        },
    },
});

export const getPreviewJobStatusRouteHandler: AppRouteHandler<
    typeof getPreviewJobStatusRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const dbUser = c.get('user');
    const userId = dbUser?.id ?? supabaseUser?.sub;

    if (!userId) {
        throw new HTTPException(401, { message: 'Authentication required' });
    }

    const jobId =
        (c.req.valid ? (c.req.valid('param' as never) as { id: string })?.id : undefined) ||
        c.req.param('id');

    if (!jobId) {
        throw new HTTPException(400, { message: 'Job ID is required' });
    }

    const job = await AiGenerationJobRepository.getJobById(jobId, c.get('dbClient'));
    if (!job) {
        throw new HTTPException(404, { message: 'Generation job not found' });
    }

    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId,
        claimedRole: c.get('role') || supabaseUser?.user_metadata?.role,
    });
    const callerInstitutionId = c.get('institutionId');

    const isOwner = job.user_id === userId;
    const isSuperAdmin = role === 'superadmin';
    const isAdminInSameInstitution =
        role === 'admin' &&
        Boolean(callerInstitutionId) &&
        job.institution_id === callerInstitutionId;

    if (!isOwner && !isSuperAdmin && !isAdminInSameInstitution) {
        throw new HTTPException(404, { message: 'Generation job not found' });
    }

    return c.json(
        {
            success: true as const,
            data: {
                jobId: job.id,
                status: job.status,
                progress: job.progress,
                currentStep: job.current_step,
                result: job.result,
                error: job.error,
                createdAt: job.created_at.toISOString(),
                updatedAt: job.updated_at.toISOString(),
            },
        },
        200,
    );
};
