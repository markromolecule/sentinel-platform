import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertCanMutateParentTemplate } from '../../inheritance/inheritance-guards';
import { linkInstitutionBranchSchema } from '../institution.dto';
import { InstitutionHierarchyService } from '../services/institution-hierarchy.service';

export const linkInstitutionBranchRoute = createRoute({
    method: 'post',
    path: '/{id}/branches',
    tags: ['Institutions'],
    summary: 'Link a child branch institution',
    description: 'Links an existing institution as a child branch of the parent institution.',
    request: {
        params: linkInstitutionBranchSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: linkInstitutionBranchSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: linkInstitutionBranchSchema.response,
                },
            },
            description: 'Institution branch linked successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const linkInstitutionBranchRouteHandler: AppRouteHandler<
    typeof linkInstitutionBranchRoute
> = async (c) => {
    try {
        assertCanMutateParentTemplate(c);
        requireActivePermission(
            c,
            'institutions:update',
            'Forbidden. Missing institutions:update permission.',
        );

        const { id } = c.req.valid('param');
        const { branchInstitutionId } = c.req.valid('json');
        const branch = await InstitutionHierarchyService.linkBranch(
            c.get('dbClient'),
            id,
            branchInstitutionId,
        );

        return c.json(
            {
                message: 'Institution branch linked successfully',
                data: branch,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Link institution branch error:');
    }
};
