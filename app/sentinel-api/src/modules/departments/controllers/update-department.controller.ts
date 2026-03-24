import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { updateDepartmentSchema } from '../departments.dto';
import { DepartmentService } from '../departments.service';

export const updateDepartmentRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Departments'],
    summary: 'Update a department',
    description: 'Updates an existing department.',
    request: {
        params: updateDepartmentSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateDepartmentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateDepartmentSchema.response,
                },
            },
            description: 'Department updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateDepartmentRouteHandler: AppRouteHandler<typeof updateDepartmentRoute> = async (
    c,
) => {
    try {
        const id = c.req.valid('param').id;
        const body = c.req.valid('json');
        const user = c.get('user');
        const institutionId = c.get('institutionId');

        const department = await DepartmentService.updateDepartment(
            c.get('dbClient'),
            id,
            body,
            user.id,
            institutionId,
        );

        return c.json(
            {
                message: 'Department updated successfully',
                data: department,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update department error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, error?.status || 500);
    }
};
