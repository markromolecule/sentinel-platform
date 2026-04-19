import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getInstructorStudentEnrollmentsSchema } from '../user.dto';
import { UserService } from '../user.service';

export const getInstructorStudentEnrollmentsRoute = createRoute({
    method: 'get',
    path: '/instructor-students',
    tags: ['Users'],
    summary: 'Get instructor student enrollments',
    description:
        'Retrieves one row per instructor-scoped student enrollment for the authenticated instructor.',
    request: getInstructorStudentEnrollmentsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getInstructorStudentEnrollmentsSchema.response,
                },
            },
            description: 'Instructor student enrollments fetched successfully',
        },
        403: {
            description: 'Forbidden',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getInstructorStudentEnrollmentsRouteHandler: AppRouteHandler<
    typeof getInstructorStudentEnrollmentsRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (role !== 'instructor') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { search } = c.req.valid('query');

        const instructorProfileId = user.user_profiles?.user_id;

        if (!instructorProfileId) {
            return c.json({ error: 'Instructor profile not found' }, 404 as any);
        }

        const records = await UserService.getInstructorStudentEnrollments(
            c.get('dbClient'),
            institutionId || undefined,
            instructorProfileId,
            search,
        );

        return c.json(
            {
                message: 'Instructor student enrollments fetched successfully',
                data: records,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch instructor student enrollments error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
