import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { getDepartmentsSchema } from '../onboarding.dto';
import { OnboardingService } from '../onboarding.service';

export const getOnboardingDepartmentsRoute = createRoute({
    method: 'get',
    path: '/departments',
    tags: ['Onboarding'],
    summary: 'Get list of departments during onboarding',
    description: 'Retrieves all departments suitable for a new student.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getDepartmentsSchema.response,
                },
            },
            description: 'Departments fetched successfully',
        },
        500: { description: 'Internal Server Error' },
    },
});

export const getOnboardingDepartmentsRouteHandler: AppRouteHandler<
    typeof getOnboardingDepartmentsRoute
> = async (c) => {
    try {
        const rawDepartments = await OnboardingService.getDepartments(c.get('dbClient'));

        const departments = rawDepartments.map((dept) => ({
            department_id: dept.department_id,
            department_name: dept.department_name,
            department_code: dept.department_code,
            created_at: dept.created_at,
            created_by: dept.created_by,
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
