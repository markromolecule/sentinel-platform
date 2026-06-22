import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import { createQuestionBankCollectionSchema } from '../question-bank.dto';
import { createQuestionBankCollectionService } from '../services/create-question-bank-collection.service';

export const createQuestionBankCollectionRoute = createRoute({
    method: 'post',
    path: '/collections',
    tags: ['Question Bank'],
    summary: 'Create a question bank collection',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createQuestionBankCollectionSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Collection created successfully',
            content: {
                'application/json': {
                    schema: createQuestionBankCollectionSchema.response,
                },
            },
        },
    },
});

export const createQuestionBankCollectionRouteHandler: AppRouteHandler<
    typeof createQuestionBankCollectionRoute
> = async (c) => {
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

    const collection = await createQuestionBankCollectionService({
        dbClient: c.get('dbClient'),
        body,
        institutionId,
        userId: user.id,
    });

    return c.json(
        {
            message: 'Collection created successfully',
            data: collection,
        },
        201,
    );
};
