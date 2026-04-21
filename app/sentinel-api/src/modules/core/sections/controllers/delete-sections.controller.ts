import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteSectionsSchema } from '../sections.dto';
import { SectionService } from '../sections.service';

export const deleteSectionsRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Sections', 'Admin'],
    summary: 'Bulk delete sections',
    description: 'Deletes multiple sections at once.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteSectionsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSectionsSchema.response,
                },
            },
            description: 'Sections deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSectionsRouteHandler: AppRouteHandler<typeof deleteSectionsRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'sections:delete',
            'Forbidden. Missing sections:delete permission.',
        );

        const { ids } = c.req.valid('json');
        const institutionId = c.get('institutionId');

        await SectionService.deleteSections(c.get('dbClient'), ids, institutionId);

        return c.json(
            {
                message: 'Sections deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete sections error:');
    }
};
