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
    request: getDepartmentsSchema.request,
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
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Allow students to fetch departments ONLY through the /onboarding routes, not here.
        if (
            role !== 'admin' &&
            role !== 'superadmin' &&
            role !== 'instructor' &&
            role !== 'support'
        ) {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        // Regular admins MUST have an institution assigned
        if (role !== 'superadmin' && role !== 'support' && !institutionId) {
            return c.json(
                {
                    message: 'No institution assigned to this user',
                    data: [],
                },
                200,
            );
        }

        const { search, institutionId: queryInstitutionId } = c.req.valid('query');
        
        // Use institutionId from query if superadmin, otherwise use from context
        const finalInstitutionId =
            role === 'superadmin' || role === 'support'
                ? (queryInstitutionId || institutionId)
                : institutionId;

        const departments = await DepartmentService.getDepartments(
            c.get('dbClient'),
            finalInstitutionId,
            search,
        );

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
