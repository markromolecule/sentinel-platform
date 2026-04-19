import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteClassroomStudentSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';

export const deleteClassroomStudentRoute = createRoute({
    method: 'delete',
    path: '/:id/students/:studentId',
    tags: ['Classrooms'],
    summary: 'Unenroll a classroom student',
    description: 'Deletes a student roster entry from an instructor-accessible classroom.',
    request: {
        params: deleteClassroomStudentSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteClassroomStudentSchema.response,
                },
            },
            description: 'Student unenrolled successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Student enrollment not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteClassroomStudentRouteHandler: AppRouteHandler<
    typeof deleteClassroomStudentRoute
> = async (c) => {
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
                { error: 'Forbidden. Only instructors can manage classroom rosters.' },
                403 as any,
            );
        }

        const { id, studentId } = c.req.valid('param');

        await ClassroomService.deleteClassroomStudent(c.get('dbClient'), {
            classGroupId: id,
            studentId,
            userId: user.id,
            institutionId,
        });

        return c.json(
            {
                message: 'Student unenrolled successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete classroom student error:');
    }
};
