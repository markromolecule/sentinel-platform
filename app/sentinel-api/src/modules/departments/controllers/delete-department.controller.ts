import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
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
        const id = c.req.valid('param').id;

        await DepartmentService.deleteDepartment(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Department deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete department error:', error);
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2003' || code === '23503') {
            return c.json({ error: 'Cannot delete department because it is being used.' }, 409);
        }
        if (error.name === 'NotFoundError') {
            return c.json({ error: 'Department not found' }, 404);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
