import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getClassroomsSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';

export const getClassroomsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Classrooms'],
    summary: 'Get instructor classrooms',
    description: 'Retrieves configured classrooms owned by the authenticated instructor.',
    request: getClassroomsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getClassroomsSchema.response,
                },
            },
            description: 'Classrooms fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getClassroomsRouteHandler: AppRouteHandler<typeof getClassroomsRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        if (role !== 'instructor') {
            return c.json(
                { error: 'Forbidden. Only instructors can view classrooms.' },
                403 as any,
            );
        }

        const { search } = c.req.valid('query');
        const classrooms = await ClassroomService.getClassrooms(c.get('dbClient'), {
            userId: user.id,
            institutionId,
            search,
        });

        return c.json(
            {
                message: 'Classrooms fetched successfully',
                data: classrooms,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get classrooms error:');
    }
};
