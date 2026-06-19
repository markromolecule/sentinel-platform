import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
} from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import {
    examIdParams,
    reviewExamIncidentsBodySchema,
    reviewExamIncidentsResponseSchema,
} from '../incidents.dto';
import { IncidentsService } from '../incidents.service';

export const reviewExamIncidentsRoute = createRoute({
    method: 'patch',
    path: '/:id/incidents/review',
    tags: ['Exams'],
    summary: 'Confirm or dismiss one or more incidents',
    request: {
        params: examIdParams,
        body: {
            content: {
                'application/json': {
                    schema: reviewExamIncidentsBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Incidents reviewed successfully',
            content: {
                'application/json': {
                    schema: reviewExamIncidentsResponseSchema,
                },
            },
        },
    },
});

export const reviewExamIncidentsRouteHandler: AppRouteHandler<
    typeof reviewExamIncidentsRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    requireActivePermission(c, 'incidents:review');

    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: c.get('role') || supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);

    const reviewerUserId = user?.id || '';

    const userScope = {
        role: resolvedRole || '',
        userId: user?.id,
        departmentId: user?.user_profiles?.department_id ?? null,
        courseId: user?.user_profiles?.course_id ?? null,
    };

    const { updatedCount, updatedAt } = await IncidentsService.reviewExamIncidentsData({
        dbClient: c.get('dbClient'),
        reviewerUserId,
        payload: body,
        examId: id,
        userScope,
    });

    return c.json({
        message: 'Incidents reviewed successfully',
        data: {
            updatedCount,
            updatedAt: updatedAt.toISOString(),
        },
    });
};
