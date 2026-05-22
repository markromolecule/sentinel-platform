import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import {
    generateAnalyticsReportBodySchema,
    generateAnalyticsReportResponseSchema,
} from '../analytics.dto';
import { AnalyticsService } from '../analytics.service';

export const generateAnalyticsReportRoute = createRoute({
    method: 'post',
    path: '/reports',
    tags: ['Analytics'],
    summary: 'Generate an analytics report',
    description:
        'Triggers the generation of a new analytics report and returns the created record.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: generateAnalyticsReportBodySchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: generateAnalyticsReportResponseSchema,
                },
            },
            description: 'Analytics report generated successfully',
        },
        400: { description: 'Bad Request / Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const generateAnalyticsReportRouteHandler: AppRouteHandler<
    typeof generateAnalyticsReportRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'analytics:view',
            'Forbidden. You do not have permission to view analytics.',
        );

        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const role = c.get('role');

        if (!institutionId && role !== 'support' && role !== 'superadmin') {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const payload = c.req.valid('json');

        const data = await AnalyticsService.generateReport({
            dbClient: c.get('dbClient'),
            userId: user.id,
            title: payload.title,
            type: payload.type,
            format: payload.format,
        });

        return c.json(
            {
                success: true,
                message: 'Analytics report generated successfully',
                data,
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Generate analytics report error:');
    }
};
