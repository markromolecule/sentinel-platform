import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { AnnouncementService } from '../announcement.service';
import { updateAnnouncementSchema } from '../announcement.dto';

export const updateAnnouncementRoute = createRoute({
    method: 'patch',
    path: '/:id',
    tags: ['Announcements'],
    summary: 'Update announcement',
    description: 'Update an existing announcement.',
    request: {
        params: updateAnnouncementSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateAnnouncementSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateAnnouncementSchema.response,
                },
            },
            description: 'Updated successfully',
        },
        400: { description: 'Bad Request / Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateAnnouncementRouteHandler: AppRouteHandler<
    typeof updateAnnouncementRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'announcement:update',
            'Forbidden. You do not have permission to update announcements.',
        );
        const institutionId = c.get('institutionId');
        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');
        const body = c.req.valid('json');
        const db = c.get('dbClient');
        const service = new AnnouncementService(db);
        const announcement = await service.update(id, body as any, institutionId, {
            notifyOnUpdate: true,
        });

        return c.json(
            {
                success: true,
                message: 'Announcement updated successfully',
                data: announcement as any,
            },
            200,
        );
    } catch (err: any) {
        return respondWithRouteError(c, err, 'Update announcement error:');
    }
};
