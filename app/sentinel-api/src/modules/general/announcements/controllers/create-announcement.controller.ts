import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { AnnouncementService } from '../announcement.service';
import { createAnnouncementSchema } from '../announcement.dto';

export const createAnnouncementRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Announcements'],
    summary: 'Create announcement',
    description: 'Create a new announcement scoped to the active institution.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createAnnouncementSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createAnnouncementSchema.response,
                },
            },
            description: 'Created successfully',
        },
        400: { description: 'Bad Request / Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const createAnnouncementRouteHandler: AppRouteHandler<
    typeof createAnnouncementRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'announcement:create',
            'Forbidden. You do not have permission to create announcements.',
        );
        const institutionId = c.get('institutionId');
        const user = c.get('user');
        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const body = c.req.valid('json');
        const db = c.get('dbClient');
        const service = new AnnouncementService(db);
        const announcement = await service.create(body as any, user.id, institutionId);

        return c.json(
            {
                success: true,
                message: 'Announcement created successfully',
                data: announcement as any,
            },
            201,
        );
    } catch (err: any) {
        return respondWithRouteError(c, err, 'Create announcement error:');
    }
};
