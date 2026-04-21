import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteInstitutionsSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const deleteInstitutionsRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Institutions', 'Support'],
    summary: 'Bulk delete institutions',
    description: 'Deletes multiple institutions at once.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteInstitutionsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteInstitutionsSchema.response,
                },
            },
            description: 'Institutions deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict (Institutions in use)' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteInstitutionsRouteHandler: AppRouteHandler<
    typeof deleteInstitutionsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'institutions:delete',
            'Forbidden. Missing institutions:delete permission.',
        );

        const { ids } = c.req.valid('json');

        await InstitutionService.deleteInstitutions(c.get('dbClient'), ids);

        return c.json(
            {
                message: 'Institutions deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete institutions error:');
    }
};
