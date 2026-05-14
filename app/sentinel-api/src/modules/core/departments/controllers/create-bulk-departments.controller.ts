import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { createBulkDepartmentsSchema } from '../departments.dto';
import { DepartmentService } from '../departments.service';

export const createBulkDepartmentsRoute = createRoute({
    method: 'post',
    path: '/bulk',
    tags: ['Departments'],
    summary: 'Bulk create departments',
    description: 'Creates multiple new departments.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createBulkDepartmentsSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createBulkDepartmentsSchema.response,
                },
            },
            description: 'Departments created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

/**
 * Handler for bulk creating departments.
 * Requires 'departments:create' permission.
 * Support role can specify any institution, while others are restricted to their own.
 */
export const createBulkDepartmentsRouteHandler: AppRouteHandler<
    typeof createBulkDepartmentsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'departments:create',
            'Forbidden. Missing departments:create permission.',
        );
        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Support role can manage any institution, ignoring their own profile institution
        const enforcedInstitutionId = role === 'support' ? undefined : institutionId;

        const departments = await DepartmentService.bulkCreateDepartments(
            c.get('dbClient'),
            body,
            user.id,
            enforcedInstitutionId,
        );

        return c.json(
            {
                message: 'Departments created successfully',
                data: departments,
            },
            201,
        );
    } catch (error: any) {
        if (error instanceof HTTPException) {
            if (error.status >= 500) {
                console.error('Bulk create departments error:', error);
            }

            return c.json(
                {
                    message: error.message || 'Request failed',
                },
                error.status,
            );
        }

        console.error('Bulk create departments error:', error);
        return c.json(
            {
                message: error?.message || 'Internal Server Error',
            },
            error?.status || 500,
        );
    }
};
