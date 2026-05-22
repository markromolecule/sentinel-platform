import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { analyticsQuerySchema, analyticsDepartmentIntegrityResponseSchema } from '../analytics.dto';
import { AnalyticsService } from '../analytics.service';

export const getAnalyticsDepartmentIntegrityRoute = createRoute({
    method: 'get',
    path: '/department-integrity',
    tags: ['Analytics'],
    summary: 'Get department integrity metrics',
    description: 'Retrieves exam completion and proctoring metrics grouped by department.',
    request: {
        query: analyticsQuerySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: analyticsDepartmentIntegrityResponseSchema,
                },
            },
            description: 'Department integrity metrics fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getAnalyticsDepartmentIntegrityRouteHandler: AppRouteHandler<
    typeof getAnalyticsDepartmentIntegrityRoute
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

        const data = await AnalyticsService.getDepartmentIntegrity({
            dbClient: c.get('dbClient'),
            institutionId: targetInstitutionId,
        });

        return c.json(
            {
                success: true,
                message: 'Department integrity metrics fetched successfully',
                data,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get department integrity error:');
    }
};
