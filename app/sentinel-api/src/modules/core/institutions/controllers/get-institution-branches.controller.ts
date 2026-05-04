import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getInstitutionBranchesSchema } from '../institution.dto';
import { InstitutionHierarchyService } from '../services/institution-hierarchy.service';

export const getInstitutionBranchesRoute = createRoute({
    method: 'get',
    path: '/{id}/branches',
    tags: ['Institutions'],
    summary: 'Get child branch institutions',
    description: 'Retrieves child institutions linked to a parent institution.',
    request: {
        params: getInstitutionBranchesSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getInstitutionBranchesSchema.response,
                },
            },
            description: 'Institution branches fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getInstitutionBranchesRouteHandler: AppRouteHandler<
    typeof getInstitutionBranchesRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'institutions:view',
            'Forbidden. Missing institutions:view permission.',
        );

        const { id } = c.req.valid('param');
        const branches = await InstitutionHierarchyService.getBranches(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Institution branches fetched successfully',
                data: branches,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Fetch institution branches error:');
    }
};
