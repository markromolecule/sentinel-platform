import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { bulkDeleteClassroomsSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

/**
 * Route definition for bulk deleting classrooms.
 */
export const bulkDeleteClassroomsRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Classrooms'],
    summary: 'Bulk delete classrooms',
    description:
        'Deletes multiple instructor-accessible classrooms and their associated roster entries.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: bulkDeleteClassroomsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: bulkDeleteClassroomsSchema.response,
                },
            },
            description: 'Classrooms deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classrooms not found' },
        500: { description: 'Internal Server Error' },
    },
});

/**
 * Route handler for bulk deleting classrooms.
 */
export const bulkDeleteClassroomsRouteHandler: AppRouteHandler<
    typeof bulkDeleteClassroomsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:delete',
            'Forbidden. Only instructors can delete classrooms.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');
        const userRole = c.get('role');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { ids } = c.req.valid('json');

        await ClassroomService.bulkDeleteClassrooms(c.get('dbClient'), {
            classGroupIds: ids,
            userId: user.id,
            institutionId,
            userRole,
        });

        return c.json(
            {
                message: 'Classrooms deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete classrooms error:');
    }
};
