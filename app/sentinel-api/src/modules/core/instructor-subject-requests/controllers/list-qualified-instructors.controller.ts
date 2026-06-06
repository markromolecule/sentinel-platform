import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { listQualifiedInstructorsSchema } from '../instructor-subject-requests.dto';
import { InstructorQualificationsService } from '../services/instructor-qualifications.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const listQualifiedInstructorsRoute = createRoute({
    method: 'get',
    path: '/subjects/:subjectId/instructors',
    tags: ['Instructor Qualifications'],
    summary: 'List qualified instructors for a subject',
    description:
        'Lists all instructors qualified to teach a specific subject (both derived and explicit).',
    request: {
        params: listQualifiedInstructorsSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: listQualifiedInstructorsSchema.response,
                },
            },
            description: 'Qualified instructors retrieved successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const listQualifiedInstructorsRouteHandler: AppRouteHandler<
    typeof listQualifiedInstructorsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:view',
            'Forbidden. You do not have permission to view qualified instructors.',
        );

        const institutionId = c.get('institutionId');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { subjectId } = c.req.valid('param');

        const instructors = await InstructorQualificationsService.listQualifiedInstructors(
            c.get('dbClient'),
            {
                subjectId,
                institutionId,
            },
        );

        return c.json({
            message: 'Qualified instructors retrieved successfully',
            data: instructors as any,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'List qualified instructors error:');
    }
};
