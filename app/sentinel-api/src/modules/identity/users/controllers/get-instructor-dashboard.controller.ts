import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { instructorDashboardSchema } from '../user.dto';
import { UserService } from '../user.service';

export const getInstructorDashboardRoute = createRoute({
    method: 'get',
    path: '/instructor-dashboard',
    tags: ['Users'],
    summary: 'Get instructor dashboard stats and recent exams',
    description:
        'Retrieves aggregated statistics and the 5 most recent exams for the authenticated instructor.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: instructorDashboardSchema.response,
                },
            },
            description: 'Instructor dashboard metrics fetched successfully',
        },
        403: {
            description: 'Forbidden',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getInstructorDashboardRouteHandler: AppRouteHandler<
    typeof getInstructorDashboardRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (role !== 'instructor') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const instructorProfileId = user.user_profiles?.user_id;

        if (!instructorProfileId) {
            return c.json({ error: 'Instructor profile not found' }, 404 as any);
        }

        const data = await UserService.getInstructorDashboard(
            c.get('dbClient'),
            instructorProfileId,
            institutionId || undefined,
        );

        return c.json(
            {
                message: 'Instructor dashboard metrics fetched successfully',
                data,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch instructor dashboard error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
