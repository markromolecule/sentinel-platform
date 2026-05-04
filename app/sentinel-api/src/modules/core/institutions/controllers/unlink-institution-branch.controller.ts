import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertCanMutateParentTemplate } from '../../inheritance/inheritance-guards';
import { unlinkInstitutionBranchSchema } from '../institution.dto';
import { InstitutionHierarchyService } from '../services/institution-hierarchy.service';

export const unlinkInstitutionBranchRoute = createRoute({
    method: 'delete',
    path: '/{id}/branches/{branchId}',
    tags: ['Institutions'],
    summary: 'Unlink a child branch institution',
    description: 'Removes the parent-child link and returns the branch to standalone status.',
    request: {
        params: unlinkInstitutionBranchSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: unlinkInstitutionBranchSchema.response,
                },
            },
            description: 'Institution branch unlinked successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const unlinkInstitutionBranchRouteHandler: AppRouteHandler<
    typeof unlinkInstitutionBranchRoute
> = async (c) => {
    try {
        assertCanMutateParentTemplate(c);
        requireActivePermission(
            c,
            'institutions:update',
            'Forbidden. Missing institutions:update permission.',
        );

        const { id, branchId } = c.req.valid('param');
        const branch = await InstitutionHierarchyService.unlinkBranch(
            c.get('dbClient'),
            id,
            branchId,
        );

        return c.json(
            {
                message: 'Institution branch unlinked successfully',
                data: branch,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Unlink institution branch error:');
    }
};
