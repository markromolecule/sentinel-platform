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

        const rawDepartment = await DepartmentService.createDepartment(c.get('dbClient'), {
            name: body.name,
            code: body.code,
            createdBy: user.id,
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
                message: 'Department created successfully',
                data: department,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create department error:', error);
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'Department name already exists' }, 409);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
