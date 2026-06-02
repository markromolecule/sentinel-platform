import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { AnnouncementService } from '../announcement.service';
import { getAnnouncementsSchema } from '../announcement.dto';

export const getAnnouncementsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Announcements'],
    summary: 'List announcements',
    description: 'Retrieve paginated list of announcements scoped to the active institution.',
    request: {
        query: getAnnouncementsSchema.request.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getAnnouncementsSchema.response,
                },
            },
            description: 'Success',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getAnnouncementsRouteHandler: AppRouteHandler<
    typeof getAnnouncementsRoute
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

        const queryParams = c.req.valid('query');
        const db = c.get('dbClient');
        const service = new AnnouncementService(db);
        const { items, total } = await service.findAll(queryParams as any, institutionId);

        const limit = queryParams.limit || 20;
        const page = queryParams.page || 1;
        const totalPages = Math.ceil(total / limit);

        return c.json(
            {
                success: true,
                message: 'Announcements retrieved successfully',
                data: items as any,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            },
            200,
        );
    } catch (err: any) {
        return respondWithRouteError(c, err, 'Get announcements error:');
    }
};
