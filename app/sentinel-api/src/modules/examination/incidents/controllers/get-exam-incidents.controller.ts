import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
} from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import {
    examIdParams,
    getExamIncidentsQuerySchema,
    getExamIncidentsResponseSchema,
} from '../incidents.dto';
import { IncidentsService } from '../incidents.service';

export const getExamIncidentsRoute = createRoute({
    method: 'get',
    path: '/:id/incidents',
    tags: ['Exams'],
    summary: 'Get paginated telemetry incidents for an exam',
    request: {
        params: examIdParams,
        query: getExamIncidentsQuerySchema,
    },
    responses: {
        200: {
            description: 'Exam incidents fetched successfully',
            content: {
                'application/json': {
                    schema: getExamIncidentsResponseSchema,
                },
            },
        },
    },
});

export const getExamIncidentsRouteHandler: AppRouteHandler<typeof getExamIncidentsRoute> = async (
    c,
) => {
    const { id } = c.req.valid('param');
    const filters = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    requireActivePermission(c, 'incidents:view');

    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: c.get('role') || supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);

    const userScope = {
        role: resolvedRole || '',
        userId: user?.id,
        departmentId: user?.user_profiles?.department_id ?? null,
        courseId: user?.user_profiles?.course_id ?? null,
    };

    const { data, total } = await IncidentsService.getExamIncidentsData({
        dbClient: c.get('dbClient'),
        examId: id,
        filters,
        userScope,
    });

    const limit = filters.limit ?? 30;
    const totalPages = Math.ceil(total / limit);

    return c.json({
        message: 'Exam incidents fetched successfully',
        data,
        meta: {
            total,
            page: filters.page ?? 1,
            limit,
            totalPages,
        },
    });
};
