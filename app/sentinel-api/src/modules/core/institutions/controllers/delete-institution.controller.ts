import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteInstitutionSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const deleteInstitutionRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Institutions'],
    summary: 'Delete an institution',
    description: 'Deletes an existing institution.',
    request: {
        params: deleteInstitutionSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteInstitutionSchema.response,
                },
            },
            description: 'Institution deleted successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const deleteInstitutionRouteHandler: AppRouteHandler<typeof deleteInstitutionRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'institutions:delete',
            'Forbidden. Missing institutions:delete permission.',
        );

        const { id } = c.req.valid('param');
        const user = c.get('user');

        await InstitutionService.deleteInstitution(c.get('dbClient'), id, user?.id);

        return c.json(
            {
                message: 'Institution deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete institution error:');
    }
};
