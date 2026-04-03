import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamsSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const getExamsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exams'],
    summary: 'List exams',
    request: getExamsSchema.request,
    responses: {
        200: {
            description: 'Exams fetched successfully',
            content: {
                'application/json': {
                    schema: getExamsSchema.response,
                },
            },
        },
    },
});

export const getExamsRouteHandler: AppRouteHandler<typeof getExamsRoute> = async (c) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(role);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: query.institutionId,
    });

    const exams = await ExamService.getExams(c.get('dbClient'), query, institutionId);

    return c.json({
        message: 'Exams fetched successfully',
        data: exams,
    });
};
