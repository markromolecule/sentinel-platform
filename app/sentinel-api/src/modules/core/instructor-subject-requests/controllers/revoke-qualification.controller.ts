import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { revokeQualificationSchema } from '../instructor-subject-requests.dto';
import { InstructorQualificationsService } from '../services/instructor-qualifications.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const revokeQualificationRoute = createRoute({
    method: 'delete',
    path: '/qualifications/:instructorId/:subjectId',
    tags: ['Instructor Qualifications'],
    summary: 'Revoke a subject qualification from an instructor',
    description:
        'Allows an administrator to revoke an explicit subject qualification from an instructor.',
    request: {
        params: revokeQualificationSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: revokeQualificationSchema.response,
                },
            },
            description: 'Subject qualification revoked successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Instructor profile or qualification not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const revokeQualificationRouteHandler: AppRouteHandler<
    typeof revokeQualificationRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:update',
            'Forbidden. You do not have permission to manage instructor qualifications.',
        );

        const institutionId = c.get('institutionId');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { instructorId, subjectId } = c.req.valid('param');

        await InstructorQualificationsService.revokeQualification(c.get('dbClient'), {
            instructorId,
            subjectId,
            institutionId,
        });

        return c.json({
            message: 'Subject qualification revoked successfully',
            data: null,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Revoke qualification error:');
    }
};
