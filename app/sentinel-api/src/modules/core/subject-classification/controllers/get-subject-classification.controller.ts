import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getSubjectClassificationSchema } from '../subject-classification.dto';
import { SubjectClassificationService } from '../subject-classification.service';
import { toSubjectClassificationResponse } from '../helper/response-utils';

export const getSubjectClassificationRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Subject Classification'],
    summary: 'Get subject classification details',
    description: 'Retrieves a single subject classification group and its assigned subjects.',
    request: getSubjectClassificationSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSubjectClassificationSchema.response,
                },
            },
            description: 'Subject classification retrieved successfully',
        },
        404: { description: 'Subject classification not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getSubjectClassificationRouteHandler: AppRouteHandler<
    typeof getSubjectClassificationRoute
> = async (c) => {
    try {
        requireActivePermission(c, 'subjects:view', 'Forbidden. Missing subjects:view permission.');
        const institutionId = c.get('institutionId');
        const { id } = c.req.valid('param');

        const classification = await SubjectClassificationService.getSubjectClassification(
            c.get('dbClient'),
            id,
            institutionId || undefined,
        );

        if (!classification) {
            return c.json({ message: 'Subject classification not found' }, 404);
        }

        return c.json(
            {
                message: 'Subject classification retrieved successfully',
                data: toSubjectClassificationResponse(classification),
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get subject classification error:');
    }
};
