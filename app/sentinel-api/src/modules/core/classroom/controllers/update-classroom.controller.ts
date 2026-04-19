import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateClassroomSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';

export const updateClassroomRoute = createRoute({
    method: 'patch',
    path: '/:id',
    tags: ['Classrooms'],
    summary: 'Rename a classroom',
    description: 'Updates classroom metadata for an instructor-accessible class group.',
    request: {
        params: updateClassroomSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateClassroomSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateClassroomSchema.response,
                },
            },
            description: 'Classroom updated successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateClassroomRouteHandler: AppRouteHandler<typeof updateClassroomRoute> = async (
    c,
) => {
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
                { error: 'Forbidden. Only instructors can rename classrooms.' },
                403 as any,
            );
        }

        const { id } = c.req.valid('param');
        const payload = c.req.valid('json');
        const classroom = await ClassroomService.updateClassroom(c.get('dbClient'), {
            classGroupId: id,
            payload,
            userId: user.id,
            institutionId,
        });

        return c.json(
            {
                message: 'Classroom updated successfully',
                data: classroom,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Update classroom error:');
    }
};
