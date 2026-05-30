import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { smartSuggestionsSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const getSmartSuggestionsRoute = createRoute({
    method: 'get',
    path: '/:id/suggestions',
    tags: ['Classrooms'],
    summary: 'Get smart suggestions for classroom instructor assignment',
    description: 'Retrieves ranked and qualified instructor recommendations for a specific classroom.',
    request: {
        params: smartSuggestionsSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: smartSuggestionsSchema.response,
                },
            },
            description: 'Ranked instructor suggestions retrieved successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getSmartSuggestionsRouteHandler: AppRouteHandler<
    typeof getSmartSuggestionsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:view',
            'Forbidden. You do not have permission to view classroom suggestions.',
        );

        const institutionId = c.get('institutionId');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');

        const suggestions = await ClassroomService.getSmartSuggestions(c.get('dbClient'), {
            classGroupId: id,
            institutionId,
        });

        return c.json({
            message: 'Ranked instructor suggestions retrieved successfully',
            data: suggestions as any,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get smart suggestions error:');
    }
};
