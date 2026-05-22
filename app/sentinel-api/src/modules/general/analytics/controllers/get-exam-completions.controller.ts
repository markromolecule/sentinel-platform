import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { analyticsQuerySchema, analyticsExamCompletionsResponseSchema } from '../analytics.dto';
import { AnalyticsService } from '../analytics.service';

export const getAnalyticsExamCompletionsRoute = createRoute({
    method: 'get',
    path: '/exam-completions',
    tags: ['Analytics'],
    summary: 'Get exam completion rates',
    description: 'Retrieves completed vs dropped exam attempt statistics grouped by day of week.',
    request: {
        query: analyticsQuerySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: analyticsExamCompletionsResponseSchema,
                },
            },
            description: 'Exam completion statistics fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getAnalyticsExamCompletionsRouteHandler: AppRouteHandler<
    typeof getAnalyticsExamCompletionsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            ['dashboard:view_analytics', 'reports:view'],
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

        const data = await AnalyticsService.getExamCompletions({
            dbClient: c.get('dbClient'),
            institutionId: targetInstitutionId,
        });

        return c.json(
            {
                success: true,
                message: 'Exam completions statistics fetched successfully',
                data,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get analytics exam completions error:');
    }
};
