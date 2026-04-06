import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { getQuestionTypesSchema } from '../question-type.dto';
import { QuestionTypeService } from '../question-type.service';

export const getQuestionTypesRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Question Types'],
    summary: 'List available question types for assessment builders',
    responses: {
        200: {
            description: 'Question types fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionTypesSchema.response,
                },
            },
        },
    },
});

export const getQuestionTypesRouteHandler: AppRouteHandler<
    typeof getQuestionTypesRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    return c.json({
        message: 'Question types fetched successfully',
        data: QuestionTypeService.getQuestionTypes(),
    });
};
