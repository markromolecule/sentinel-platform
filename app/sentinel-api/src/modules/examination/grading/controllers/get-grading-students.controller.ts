import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getGradingStudentsSchema } from '../grading.dto';
import { GradingService } from '../grading.service';

export const getGradingStudentsRoute = createRoute({
    method: 'get',
    path: '/:id/students',
    tags: ['Exams'],
    summary: 'List students for instructor grading a specific exam',
    request: {
        params: getGradingStudentsSchema.request.params,
        query: getGradingStudentsSchema.request.query,
    },
    responses: {
        200: {
            description: 'Grading students fetched successfully',
            content: {
                'application/json': {
                    schema: getGradingStudentsSchema.response,
                },
            },
        },
    },
});

export const getGradingStudentsRouteHandler: AppRouteHandler<
    typeof getGradingStudentsRoute
> = async (c) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const { id } = c.req.valid('param');
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

    const students = await GradingService.getGradingStudents({
        dbClient: c.get('dbClient'),
        examId: id,
        userId: user?.id,
        institutionId,
        sectionId: query.sectionId,
        search: query.search,
    });

    return c.json({
        message: 'Grading students fetched successfully',
        data: students,
    });
};
