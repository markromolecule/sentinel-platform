import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import { updateQuestionBankCollectionSchema } from '../question-bank.dto';
import { QuestionBankService } from '../question-bank.service';

export const updateQuestionBankCollectionRoute = createRoute({
    method: 'put',
    path: '/collections/:id',
    tags: ['Question Bank'],
    summary: 'Update a question bank collection',
    request: {
        params: updateQuestionBankCollectionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateQuestionBankCollectionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Collection updated successfully',
            content: {
                'application/json': {
                    schema: updateQuestionBankCollectionSchema.response,
                },
            },
        },
    },
});

export const updateQuestionBankCollectionRouteHandler: AppRouteHandler<
    typeof updateQuestionBankCollectionRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(c);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: body.institutionId,
    });

    const collection = await QuestionBankService.updateCollection(
        c.get('dbClient'),
        id,
        body,
        institutionId,
        user.id,
    );

    return c.json({
        message: 'Collection updated successfully',
        data: collection,
    });
};
