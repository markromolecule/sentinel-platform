import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteUsersSchema } from '../user.dto';
import { UserService } from '../user.service';
import { resolveRequesterRole } from '../../../../lib/resolve-requester-role';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';

export const deleteUsersRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Users'],
    summary: 'Bulk delete users',
    description: 'Deletes multiple users permanently.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteUsersSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteUsersSchema.response,
                },
            },
            description: 'Users deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteUsersRouteHandler: AppRouteHandler<typeof deleteUsersRoute> = async (c) => {
    try {
        requireActivePermission(c, 'users:delete', 'Forbidden. Missing users:delete permission.');

        const { ids } = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const role = resolveRequesterRole(supabaseUser);
        const institutionId = c.get('institutionId');
        const scopedInstitutionId =
            role === 'support' || role === 'superadmin' ? undefined : institutionId;

        await UserService.deleteUsers(
            c.get('dbClient'),
            ids,
            role,
            scopedInstitutionId,
            user.id,
            user.user_profiles?.department_id ?? null,
            user.user_profiles?.course_id ?? null,
        );

        return c.json(
            {
                message: 'Users deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete users error:');
    }
};
