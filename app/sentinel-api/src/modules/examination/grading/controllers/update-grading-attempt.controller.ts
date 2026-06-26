import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssignedInstructorAttemptAccess } from '../../assign/services/exam-access';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { updateGradingAttemptSchema } from '../grading.dto';
import { GradingService } from '../grading.service';

export const updateGradingAttemptRoute = createRoute({
    method: 'post',
    path: '/attempts/:attemptId',
    tags: ['Exams'],
    summary: 'Submit grading evaluations for a student attempt',
    request: {
        params: updateGradingAttemptSchema.request.params,
        body: {
            content: {
                'application/json': {
                    schema: updateGradingAttemptSchema.request.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Grading evaluations submitted successfully',
            content: {
                'application/json': {
                    schema: updateGradingAttemptSchema.response,
                },
            },
        },
    },
});

export const updateGradingAttemptRouteHandler: AppRouteHandler<
    typeof updateGradingAttemptRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const { attemptId } = c.req.valid('param');
    const { evaluations, itemOverrides, feedback, finalize } = c.req.valid('json');
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

    if (role === 'instructor' && user?.id) {
        await assertAssignedInstructorAttemptAccess({
            dbClient: c.get('dbClient'),
            attemptId,
            userId: user.id,
            institutionId,
        });
    }

    const data = await GradingService.updateGradingAttempt({
        dbClient: c.get('dbClient'),
        attemptId,
        actorUserId: user?.id,
        institutionId,
        evaluations,
        itemOverrides,
        feedback,
        finalize,
    });

    return c.json({
        message: 'Grading evaluations submitted successfully',
        data,
    });
};
