import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { createDepartmentSchema } from '../departments.dto';
import { DepartmentService } from '../departments.service';

export const createDepartmentRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Departments'],
    summary: 'Create a department',
    description: 'Creates a new department.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createDepartmentSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createDepartmentSchema.response,
                },
            },
            description: 'Department created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const createDepartmentRouteHandler: AppRouteHandler<typeof createDepartmentRoute> = async (
    c,
) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');
        const institutionId = c.get('institutionId');

        const department = await DepartmentService.createDepartment(
            c.get('dbClient'),
            body,
            user.id,
            institutionId,
        );

        return c.json(
            {
                message: 'Department created successfully',
                data: department,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create department error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, error?.status || 500);
    }
};
