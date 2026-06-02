import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { AnnouncementService } from '../announcement.service';
import { getAnnouncementByIdSchema } from '../announcement.dto';

export const getAnnouncementByIdRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Announcements'],
    summary: 'Get announcement by ID',
    description: 'Retrieve a single announcement by ID.',
    request: {
        params: getAnnouncementByIdSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getAnnouncementByIdSchema.response,
                },
            },
            description: 'Success',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getAnnouncementByIdRouteHandler: AppRouteHandler<
    typeof getAnnouncementByIdRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'announcement:view',
            'Forbidden. You do not have permission to view announcements.',
        );
        const institutionId = c.get('institutionId');
        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');
        const db = c.get('dbClient');
        const service = new AnnouncementService(db);
        const announcement = await service.findById(id, institutionId);

        return c.json(
            {
                success: true,
                message: 'Announcement retrieved successfully',
                data: announcement as any,
            },
            200,
        );
    } catch (err: any) {
        return respondWithRouteError(c, err, 'Get announcement by ID error:');
    }
};
