import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getGradingExamsSchema } from '../grading.dto';
import { GradingService } from '../grading.service';

export const getGradingExamsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exams'],
    summary: 'List exams for instructor grading',
    request: getGradingExamsSchema.request,
    responses: {
        200: {
            description: 'Grading exams fetched successfully',
            content: {
                'application/json': {
                    schema: getGradingExamsSchema.response,
                },
            },
        },
    },
});

export const getGradingExamsRouteHandler: AppRouteHandler<typeof getGradingExamsRoute> = async (
    c,
) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
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

    const exams = await GradingService.getGradingExams({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        institutionId,
        sectionId: query.sectionId,
    });

    return c.json({
        message: 'Grading exams fetched successfully',
        data: exams,
    });
};
