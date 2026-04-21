import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteDepartmentsSchema } from '../departments.dto';
import { DepartmentService } from '../departments.service';

export const deleteDepartmentsRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Departments', 'Support'],
    summary: 'Bulk delete departments',
    description: 'Deletes multiple departments at once.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteDepartmentsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteDepartmentsSchema.response,
                },
            },
            description: 'Departments deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict (Departments in use)' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteDepartmentsRouteHandler: AppRouteHandler<
    typeof deleteDepartmentsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'departments:delete',
            'Forbidden. Missing departments:delete permission.',
        );

        const { ids } = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        const enforcedId = role === 'support' ? undefined : (institutionId as string | undefined);

        await DepartmentService.deleteDepartments(c.get('dbClient'), ids, enforcedId);

        return c.json(
            {
                message: 'Departments deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete departments error:');
    }
};
