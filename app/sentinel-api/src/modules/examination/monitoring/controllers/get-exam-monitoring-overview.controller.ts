import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamMonitoringOverviewSchema } from '../monitoring.dto';
import { MonitoringService } from '../monitoring.service';

export const getExamMonitoringOverviewRoute = createRoute({
    method: 'get',
    path: '/:id/monitoring',
    tags: ['Exams'],
    summary: 'Get the real monitoring overview for an exam',
    request: {
        params: getExamMonitoringOverviewSchema.params,
    },
    responses: {
        200: {
            description: 'Exam monitoring overview fetched successfully',
            content: {
                'application/json': {
                    schema: getExamMonitoringOverviewSchema.response,
                },
            },
        },
    },
});

export const getExamMonitoringOverviewRouteHandler: AppRouteHandler<
    typeof getExamMonitoringOverviewRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: c.get('role') || supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);
    const role = resolvedRole as AssessmentAllowedRole;

    const monitoring = await MonitoringService.getExamMonitoringOverview({
        dbClient: c.get('dbClient'),
        examId: id,
        institutionId: resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
        viewerRole: role,
        userId: user?.id,
    });

    return c.json({
        message: 'Exam monitoring overview fetched successfully',
        data: monitoring,
    });
};
