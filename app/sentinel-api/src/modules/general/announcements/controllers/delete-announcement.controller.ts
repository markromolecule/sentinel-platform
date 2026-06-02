import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { AnnouncementService } from '../announcement.service';
import { deleteAnnouncementSchema } from '../announcement.dto';

export const deleteAnnouncementRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Announcements'],
    summary: 'Delete announcement',
    description: 'Soft-delete an announcement.',
    request: {
        params: deleteAnnouncementSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteAnnouncementSchema.response,
                },
            },
            description: 'Deleted successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteAnnouncementRouteHandler: AppRouteHandler<
    typeof deleteAnnouncementRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'announcement:delete',
            'Forbidden. You do not have permission to delete announcements.',
        );
        const institutionId = c.get('institutionId');
        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');
        const db = c.get('dbClient');
        const service = new AnnouncementService(db);
        await service.remove(id, institutionId);

        return c.json(
            {
                success: true,
                message: 'Announcement deleted successfully',
                data: null,
            },
            200,
        );
    } catch (err: any) {
        return respondWithRouteError(c, err, 'Delete announcement error:');
    }
};
