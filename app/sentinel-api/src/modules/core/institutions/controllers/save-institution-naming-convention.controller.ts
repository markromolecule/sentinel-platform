import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { saveInstitutionNamingConventionSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const saveInstitutionNamingConventionRoute = createRoute({
    method: 'patch',
    path: '/{id}/naming-conventions',
    tags: ['Institutions'],
    summary: 'Save institution naming conventions',
    description: 'Creates or updates naming conventions for an institution.',
    request: {
        params: saveInstitutionNamingConventionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: saveInstitutionNamingConventionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: saveInstitutionNamingConventionSchema.response,
                },
            },
            description: 'Institution naming conventions saved successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const saveInstitutionNamingConventionRouteHandler: AppRouteHandler<
    typeof saveInstitutionNamingConventionRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'institutions:update',
            'Forbidden. Missing institutions:update permission.',
        );

        const updatedBy = c.get('user')?.id;
        const { id } = c.req.valid('param');
        const body = c.req.valid('json');

        const namingConventions = await InstitutionService.saveNamingConvention(
            c.get('dbClient'),
            id,
            body,
            updatedBy,
        );

        return c.json(
            {
                message: 'Institution naming conventions saved successfully',
                data: namingConventions,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Save institution naming conventions error:');
    }
};
