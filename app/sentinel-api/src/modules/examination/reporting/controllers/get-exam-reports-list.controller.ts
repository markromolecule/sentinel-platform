import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamReportsSchema } from '../reporting.dto';
import { ReportingService } from '../reporting.service';

/**
 * Route definition for fetching a paginated list of exam reports.
 */
export const getExamReportsListRoute = createRoute({
    method: 'get',
    path: '/reports',
    tags: ['Exams'],
    summary: 'List exam reports with pagination',
    request: {
        query: getExamReportsSchema.query,
    },
    responses: {
        200: {
            description: 'Exam reports fetched successfully',
            content: {
                'application/json': {
                    schema: getExamReportsSchema.response,
                },
            },
        },
    },
});

/**
 * Handler for the paginated exam reports list endpoint.
 * Restricts access to authorized roles and resolves institution visibility bounds.
 */
export const getExamReportsListRouteHandler: AppRouteHandler<
    typeof getExamReportsListRoute
> = async (c) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);
    const role = resolvedRole as AssessmentAllowedRole;

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
    });

    const departmentId =
        role === 'admin' ? (user?.user_profiles?.department_id ?? undefined) : undefined;

    const { data, total, page, limit, totalPages } = await ReportingService.getExamReportsList({
        dbClient: c.get('dbClient'),
        filters: query,
        institutionId,
        role,
        userId: user?.id,
        departmentId,
    });

    return c.json({
        message: 'Exam reports fetched successfully',
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
    });
};
