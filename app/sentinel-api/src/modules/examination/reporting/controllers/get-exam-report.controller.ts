import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamReportSchema } from '../reporting.dto';
import { ReportingService } from '../reporting.service';

export const getExamReportRoute = createRoute({
    method: 'get',
    path: '/:id/report',
    tags: ['Exams'],
    summary: 'Get the exam report for instructors and proctors',
    request: {
        params: getExamReportSchema.params,
    },
    responses: {
        200: {
            description: 'Exam report fetched successfully',
            content: {
                'application/json': {
                    schema: getExamReportSchema.response,
                },
            },
        },
    },
});

export const getExamReportRouteHandler: AppRouteHandler<typeof getExamReportRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);
    const role = resolvedRole as AssessmentAllowedRole;

    const report = await ReportingService.getExamReport({
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
        message: 'Exam report fetched successfully',
        data: report,
    });
};
