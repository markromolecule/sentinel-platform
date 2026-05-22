import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import {
    analyticsQuerySchema,
    getReportsQuerySchema,
    analyticsReportsResponseSchema,
} from '../analytics.dto';
import { AnalyticsService } from '../analytics.service';

export const getAnalyticsReportsRoute = createRoute({
    method: 'get',
    path: '/reports',
    tags: ['Analytics'],
    summary: 'Get paginated analytics reports',
    description: 'Retrieves a list of generated analytics reports for an institution.',
    request: {
        query: analyticsQuerySchema.merge(getReportsQuerySchema),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: analyticsReportsResponseSchema,
                },
            },
            description: 'Reports fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getAnalyticsReportsRouteHandler: AppRouteHandler<
    typeof getAnalyticsReportsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'analytics:view',
            'Forbidden. You do not have permission to view analytics.',
        );

        const query = c.req.valid('query');
        const role = c.get('role');
        const authedInstitutionId = c.get('institutionId');

        let targetInstitutionId = authedInstitutionId;
        if ((role === 'support' || role === 'superadmin') && query.institution_id) {
            targetInstitutionId = query.institution_id;
        }

        if (!targetInstitutionId && role !== 'support' && role !== 'superadmin') {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const data = await AnalyticsService.getReports({
            dbClient: c.get('dbClient'),
            institutionId: targetInstitutionId,
            limit: query.limit,
            page: query.page,
        });

        return c.json(
            {
                success: true,
                message: 'Reports fetched successfully',
                data,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get analytics reports error:');
    }
};
