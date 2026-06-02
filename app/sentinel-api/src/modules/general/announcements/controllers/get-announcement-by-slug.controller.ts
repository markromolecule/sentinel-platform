import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { AnnouncementService } from '../announcement.service';
import { getAnnouncementBySlugSchema } from '../announcement.dto';

export const getAnnouncementBySlugRoute = createRoute({
    method: 'get',
    path: '/slug/:slug',
    tags: ['Announcements'],
    summary: 'Get announcement by slug',
    description: 'Retrieve a single announcement by slug.',
    request: {
        params: getAnnouncementBySlugSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getAnnouncementBySlugSchema.response,
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

export const getAnnouncementBySlugRouteHandler: AppRouteHandler<
    typeof getAnnouncementBySlugRoute
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

        const { slug } = c.req.valid('param');
        const db = c.get('dbClient');
        const service = new AnnouncementService(db);
        const announcement = await service.findBySlug(slug, institutionId);

        return c.json(
            {
                success: true,
                message: 'Announcement retrieved successfully',
                data: announcement as any,
            },
            200,
        );
    } catch (err: any) {
        return respondWithRouteError(c, err, 'Get announcement by slug error:');
    }
};
