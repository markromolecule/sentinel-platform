import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { getDepartmentsSchema } from '../departments.dto';
import { DepartmentService } from '../departments.service';

export const getDepartmentsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Departments'],
    summary: 'Get all departments',
    description: 'Retrieves all departments.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getDepartmentsSchema.response,
                },
            },
            description: 'Departments fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getDepartmentsRouteHandler: AppRouteHandler<typeof getDepartmentsRoute> = async (
    c,
) => {
    try {
        const institutionId = c.get('institutionId');
        const rawDepartments = await DepartmentService.getDepartments(
            c.get('dbClient'),
            institutionId,
        );

        const departments = rawDepartments.map((department: any) => ({
            department_id: department.department_id,
            department_name: department.department_name,
            department_code: department.department_code,
            created_at: department.created_at,
            created_by: department.creator_first_name
                ? `${department.creator_first_name} ${department.creator_last_name}`
                : department.created_by,
            updated_at: department.updated_at,
            updated_by: department.updater_first_name
                ? `${department.updater_first_name} ${department.updater_last_name}`
                : department.updated_by,
        }));

        return c.json(
            {
                message: 'Departments fetched successfully',
                data: departments,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch departments error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
