import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getInstructorStudentEnrollmentDetailSchema } from '../user.dto';
import { UserService } from '../user.service';

export const getInstructorStudentEnrollmentDetailRoute = createRoute({
    method: 'get',
    path: '/:id/instructor-enrollments',
    tags: ['Users'],
    summary: 'Get instructor student enrollment detail',
    description:
        'Retrieves the authenticated instructor-scoped classroom enrollments for a single student.',
    request: {
        params: getInstructorStudentEnrollmentDetailSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getInstructorStudentEnrollmentDetailSchema.response,
                },
            },
            description: 'Instructor student enrollment detail fetched successfully',
        },
        403: {
            description: 'Forbidden',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getInstructorStudentEnrollmentDetailRouteHandler: AppRouteHandler<
    typeof getInstructorStudentEnrollmentDetailRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (role !== 'instructor') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { id } = c.req.valid('param');

        const instructorProfileId = user.user_profiles?.user_id;

        if (!instructorProfileId) {
            return c.json({ error: 'Instructor profile not found' }, 404 as any);
        }

        const records = await UserService.getInstructorStudentEnrollmentDetail(
            c.get('dbClient'),
            institutionId || undefined,
            instructorProfileId,
            id,
        );

        return c.json(
            {
                message: 'Instructor student enrollment detail fetched successfully',
                data: records,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch instructor student enrollment detail error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
