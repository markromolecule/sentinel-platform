import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { analyticsQuerySchema, analyticsIncidentTypeResponseSchema } from '../analytics.dto';
import { AnalyticsService } from '../analytics.service';

export const getAnalyticsIncidentTypeRoute = createRoute({
    method: 'get',
    path: '/incident-type',
    tags: ['Analytics'],
    summary: 'Get incident type distribution',
    description: 'Retrieves flagged incident types and percentages for an institution.',
    request: {
        query: analyticsQuerySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: analyticsIncidentTypeResponseSchema,
                },
            },
            description: 'Incident type distribution fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getAnalyticsIncidentTypeRouteHandler: AppRouteHandler<
    typeof getAnalyticsIncidentTypeRoute
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

        const data = await AnalyticsService.getIncidentType({
            dbClient: c.get('dbClient'),
            institutionId: targetInstitutionId,
        });

        return c.json(
            {
                success: true,
                message: 'Incident type distribution fetched successfully',
                data,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get analytics incident type error:');
    }
};
