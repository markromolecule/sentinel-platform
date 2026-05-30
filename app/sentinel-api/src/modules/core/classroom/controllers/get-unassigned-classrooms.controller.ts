import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { unassignedClassroomsSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const getUnassignedClassroomsRoute = createRoute({
    method: 'get',
    path: '/dashboard/unassigned',
    tags: ['Classrooms'],
    summary: 'Get unassigned classrooms list',
    description: 'Retrieves all configured classrooms that do not have any assigned instructor.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: unassignedClassroomsSchema.response,
                },
            },
            description: 'Unassigned classrooms list retrieved successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getUnassignedClassroomsRouteHandler: AppRouteHandler<
    typeof getUnassignedClassroomsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:view',
            'Forbidden. You do not have permission to view classrooms.',
        );

        const institutionId = c.get('institutionId');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const unassigned = await ClassroomService.getUnassignedClassrooms(c.get('dbClient'), institutionId);

        return c.json({
            message: 'Unassigned classrooms list retrieved successfully',
            data: unassigned as any,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get unassigned classrooms error:');
    }
};
