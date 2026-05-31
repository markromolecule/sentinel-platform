import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { submitSubjectRequestSchema } from '../instructor-subject-requests.dto';
import { InstructorSubjectRequestsService } from '../instructor-subject-requests.service';

export const submitSubjectRequestRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Instructor Subject Requests'],
    summary: 'Submit a subject qualification request',
    description: 'Allows an instructor to request qualification for a subject in their institution.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: submitSubjectRequestSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: submitSubjectRequestSchema.response,
                },
            },
            description: 'Subject request submitted successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Subject or instructor profile not found' },
        409: { description: 'Request or qualification already exists' },
        500: { description: 'Internal Server Error' },
    },
});

export const submitSubjectRequestRouteHandler: AppRouteHandler<
    typeof submitSubjectRequestRoute
> = async (c) => {
    try {
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const payload = c.req.valid('json');

        const request = await InstructorSubjectRequestsService.submitRequest(c.get('dbClient'), {
            instructorUserId: user.id,
            subjectId: payload.subjectId,
            justification: payload.justification,
            institutionId,
        });

        return c.json({
            message: 'Subject request submitted successfully',
            data: request as any,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Submit subject request error:');
    }
};
