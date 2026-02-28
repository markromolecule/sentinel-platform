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

        const rawDepartment = await DepartmentService.updateDepartment(c.get('dbClient'), id, {
            name: body.name,
            code: body.code,
        });

        const department = {
            department_id: rawDepartment.department_id,
            department_name: rawDepartment.department_name,
            department_code: rawDepartment.department_code,
            created_at: rawDepartment.created_at,
            created_by: rawDepartment.created_by,
        };

        return c.json(
            {
                message: 'Department updated successfully',
                data: department,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update department error:', error);
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'Department name already exists' }, 409);
        }
        if (error.name === 'NotFoundError') {
            return c.json({ error: 'Department not found' }, 404);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
