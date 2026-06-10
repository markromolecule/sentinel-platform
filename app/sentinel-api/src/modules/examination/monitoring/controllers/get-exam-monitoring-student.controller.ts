import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamMonitoringStudentSchema } from '../monitoring.dto';
import { MonitoringService } from '../monitoring.service';

export const getExamMonitoringStudentRoute = createRoute({
    method: 'get',
    path: '/:id/monitoring/students/:studentId',
    tags: ['Exams'],
    summary: 'Get one student monitoring detail for an exam',
    request: {
        params: getExamMonitoringStudentSchema.params,
    },
    responses: {
        200: {
            description: 'Exam monitoring student detail fetched successfully',
            content: {
                'application/json': {
                    schema: getExamMonitoringStudentSchema.response,
                },
            },
        },
    },
});

export const getExamMonitoringStudentRouteHandler: AppRouteHandler<
    typeof getExamMonitoringStudentRoute
> = async (c) => {
    const { id, studentId } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: c.get('role') || supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);
    const role = resolvedRole as AssessmentAllowedRole;

    const monitoring = await MonitoringService.getExamMonitoringStudentDetail({
        dbClient: c.get('dbClient'),
        examId: id,
        studentId,
        institutionId: resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
        viewerRole: role,
        userId: user?.id,
    });

    return c.json({
        message: 'Exam monitoring student detail fetched successfully',
        data: monitoring,
    });
};
