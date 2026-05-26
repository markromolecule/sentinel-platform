import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getLogsResponseSchema, logQuerySchema } from '../logs.dto';
import { LogsService } from '../logs.service';
import { AuthLogsService } from '../services/auth-logs.service';
import { HTTPException } from 'hono/http-exception';

export const getAuthLogsRoute = createRoute({
    method: 'get',
    path: '/auth',
    tags: ['Logs'],
    summary: 'Get authentication and session logs',
    request: {
        query: logQuerySchema,
    },
    responses: {
        200: {
            description: 'Authentication logs fetched successfully',
            content: {
                'application/json': {
                    schema: getLogsResponseSchema,
                },
            },
        },
    },
});

/**
 * Route handler for fetching authentication and session logs.
 * Validates request query parameters, resolves institutional hierarchy context,
 * enforces sub-branch data boundaries, and fetches paged logs.
 *
 * @param c Hono Context
 */
export const getAuthLogsRouteHandler: AppRouteHandler<typeof getAuthLogsRoute> = async (c) => {
    const query = c.req.valid('query');
    const dbClient = c.get('dbClient');
    const activeInstitutionId = c.get('institutionId');

    const { scopingInstitutionId, scopingBranchId } = await LogsService.resolveInstitutionHierarchy(
        dbClient,
        activeInstitutionId
    );

    // Security Check: enforce child branch data boundaries strictly
    if (scopingBranchId && query.branchId && query.branchId !== scopingBranchId) {
        throw new HTTPException(403, {
            message: 'Access denied: You are only authorized to access logs for your assigned branch.',
        });
    }

    const effectiveBranchId = scopingBranchId || query.branchId || null;

    const data = await AuthLogsService.getAuthLogs(
        dbClient,
        scopingInstitutionId,
        effectiveBranchId,
        query
    );

    return c.json({
        message: 'Authentication logs fetched successfully',
        data,
    });
};
