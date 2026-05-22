import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { analyticsQuerySchema, analyticsKPIsResponseSchema } from '../analytics.dto';
import { AnalyticsService } from '../analytics.service';

export const getAnalyticsKPIsRoute = createRoute({
    method: 'get',
    path: '/kpis',
    tags: ['Analytics'],
    summary: 'Get institution analytical KPIs',
    description: 'Retrieves core aggregated exam and incident KPIs for an institution.',
    request: {
        query: analyticsQuerySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: analyticsKPIsResponseSchema,
                },
            },
            description: 'KPIs fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getAnalyticsKPIsRouteHandler: AppRouteHandler<typeof getAnalyticsKPIsRoute> = async (
    c,
) => {
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

        const data = await AnalyticsService.getKPIs({
            dbClient: c.get('dbClient'),
            institutionId: targetInstitutionId,
        });

        return c.json(
            {
                success: true,
                message: 'KPIs fetched successfully',
                data,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get analytics KPIs error:');
    }
};
