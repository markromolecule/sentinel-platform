import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateInstitutionSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const updateInstitutionRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    tags: ['Institutions'],
    summary: 'Update an institution',
    description: 'Updates an existing institution.',
    request: {
        params: updateInstitutionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateInstitutionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateInstitutionSchema.response,
                },
            },
            description: 'Institution updated successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const updateInstitutionRouteHandler: AppRouteHandler<typeof updateInstitutionRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'institutions:update',
            'Forbidden. Missing institutions:update permission.',
        );
        const updatedBy = c.get('user')?.id;

        const { id } = c.req.valid('param');
        const body = c.req.valid('json');

        const updatedInstitution = await InstitutionService.updateInstitution(
            c.get('dbClient'),
            id,
            body,
            updatedBy,
        );

        return c.json(
            {
                message: 'Institution updated successfully',
                data: updatedInstitution,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Update institution error:');
    }
};
