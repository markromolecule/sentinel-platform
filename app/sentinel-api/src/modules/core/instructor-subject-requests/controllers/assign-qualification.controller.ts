import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { assignQualificationSchema } from '../instructor-subject-requests.dto';
import { InstructorQualificationsService } from '../services/instructor-qualifications.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const assignQualificationRoute = createRoute({
    method: 'post',
    path: '/qualifications',
    tags: ['Instructor Qualifications'],
    summary: 'Assign a subject qualification to an instructor',
    description: 'Allows an administrator to explicitly qualify an instructor for a subject.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: assignQualificationSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: assignQualificationSchema.response,
                },
            },
            description: 'Subject qualification assigned successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Instructor or subject not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const assignQualificationRouteHandler: AppRouteHandler<
    typeof assignQualificationRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:update',
            'Forbidden. You do not have permission to manage instructor qualifications.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const payload = c.req.valid('json');

        await InstructorQualificationsService.assignQualification(c.get('dbClient'), {
            instructorId: payload.instructorId,
            subjectId: payload.subjectId,
            assignedByUserId: user.id,
            institutionId,
        });

        return c.json({
            message: 'Subject qualification assigned successfully',
            data: null,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Assign qualification error:');
    }
};
