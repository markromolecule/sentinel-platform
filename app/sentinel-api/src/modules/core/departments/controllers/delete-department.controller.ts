import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteDepartmentSchema } from '../departments.dto';
import { DepartmentService } from '../departments.service';

export const deleteDepartmentRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Departments'],
    summary: 'Delete a department',
    description: 'Deletes an existing department.',
    request: {
        params: deleteDepartmentSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteDepartmentSchema.response,
                },
            },
            description: 'Department deleted successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict (Department in use)' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteDepartmentRouteHandler: AppRouteHandler<typeof deleteDepartmentRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'departments:delete',
            'Forbidden. Missing departments:delete permission.',
        );
        const id = c.req.valid('param').id;
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Support role can manage any institution, ignoring their own profile institution
        const enforcedId = role === 'support' ? undefined : institutionId;

        await DepartmentService.deleteDepartment(c.get('dbClient'), id, user.id, enforcedId);

        return c.json(
            {
                message: 'Department deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete department error:');
    }
};
