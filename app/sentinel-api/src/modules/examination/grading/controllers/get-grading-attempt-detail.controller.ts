import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssignedInstructorAttemptAccess } from '../../assign/services/exam-access';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getGradingAttemptDetailSchema } from '../grading.dto';
import { GradingService } from '../grading.service';

export const getGradingAttemptDetailRoute = createRoute({
    method: 'get',
    path: '/attempts/:attemptId',
    tags: ['Exams'],
    summary: 'Get grading detail for a student attempt',
    request: {
        params: getGradingAttemptDetailSchema.request.params,
    },
    responses: {
        200: {
            description: 'Grading details fetched successfully',
            content: {
                'application/json': {
                    schema: getGradingAttemptDetailSchema.response,
                },
            },
        },
    },
});

export const getGradingAttemptDetailRouteHandler: AppRouteHandler<
    typeof getGradingAttemptDetailRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const { attemptId } = c.req.valid('param');
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

    const data = await GradingService.getGradingAttemptDetail({
        dbClient: c.get('dbClient'),
        attemptId,
        institutionId,
    });

    return c.json({
        message: 'Grading details fetched successfully',
        data,
    });
};
