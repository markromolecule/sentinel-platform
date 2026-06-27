import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { bulkFinalizeAttemptsSchema } from '../grading.dto';
import { GradingService } from '../grading.service';

export const bulkFinalizeAttemptsRoute = createRoute({
    method: 'post',
    path: '/exams/:examId/finalize-all',
    tags: ['Exams'],
    summary: 'Bulk finalize all completed attempts for an exam',
    request: {
        params: bulkFinalizeAttemptsSchema.request.params,
    },
    responses: {
        200: {
            description: 'Completed attempts finalized successfully',
            content: {
                'application/json': {
                    schema: bulkFinalizeAttemptsSchema.response,
                },
            },
        },
    },
});

export const bulkFinalizeAttemptsRouteHandler: AppRouteHandler<
    typeof bulkFinalizeAttemptsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const { examId } = c.req.valid('param');
    const user = c.get('user');

    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(role);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
    });

    const data = await GradingService.bulkFinalizeAttempts({
        dbClient: c.get('dbClient'),
        examId,
        actorUserId: user?.id,
        institutionId,
    });

    return c.json({
        message: 'Completed attempts finalized successfully',
        data,
    });
};
