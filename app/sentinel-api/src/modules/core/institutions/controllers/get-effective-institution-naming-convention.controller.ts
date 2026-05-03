import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getEffectiveInstitutionNamingConventionSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const getEffectiveInstitutionNamingConventionRoute = createRoute({
    method: 'get',
    path: '/{id}/naming-conventions/effective',
    tags: ['Institutions'],
    summary: 'Get effective institution naming conventions',
    description:
        'Retrieves naming conventions for an institution, falling back to the parent institution when no local convention exists.',
    request: {
        params: getEffectiveInstitutionNamingConventionSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getEffectiveInstitutionNamingConventionSchema.response,
                },
            },
            description: 'Effective institution naming conventions fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getEffectiveInstitutionNamingConventionRouteHandler: AppRouteHandler<
    typeof getEffectiveInstitutionNamingConventionRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'institutions:view',
            'Forbidden. Missing institutions:view permission.',
        );

        const { id } = c.req.valid('param');
        const namingConventions = await InstitutionService.getEffectiveNamingConvention(
            c.get('dbClient'),
            id,
        );

        return c.json(
            {
                message: 'Effective institution naming conventions fetched successfully',
                data: namingConventions,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(
            c,
            error,
            'Fetch effective institution naming conventions error:',
        );
    }
};
