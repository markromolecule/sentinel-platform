import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getLogsResponseSchema, logQuerySchema } from '../logs.dto';
import { LogsService } from '../logs.service';
import { SystemLogsService } from '../services/system-logs.service';
import { HTTPException } from 'hono/http-exception';
import { hasActivePermission } from '../../../../lib/permissions';

export const getSystemLogsRoute = createRoute({
    method: 'get',
    path: '/system',
    tags: ['Logs'],
    summary: 'Get backend system and cron logs',
    request: {
        query: logQuerySchema,
    },
    responses: {
        200: {
            description: 'System logs fetched successfully',
            content: {
                'application/json': {
                    schema: getLogsResponseSchema,
                },
            },
        },
    },
});

/**
 * Route handler for fetching system diagnostic and exception logs.
 * Validates request query parameters, resolves institutional hierarchy context,
 * enforces sub-branch data boundaries, and fetches paged logs.
 *
 * @param c Hono Context
 */
export const getSystemLogsRouteHandler: AppRouteHandler<typeof getSystemLogsRoute> = async (c) => {
    const query = c.req.valid('query');
    const dbClient = c.get('dbClient');
    const activeInstitutionId = c.get('institutionId');
    const role = c.get('role');
    const activePermissionKeys = c.get('activePermissionKeys');

    const hasCrossTenant = activePermissionKeys
        ? hasActivePermission(activePermissionKeys, 'institutions:cross-tenant-view')
        : role === 'superadmin' || role === 'support';

    let scopingInstitutionId: string | undefined;
    let scopingBranchId: string | null = null;

    if (hasCrossTenant) {
        scopingInstitutionId = query.institutionId || undefined;
    } else {
        const hierarchy = await LogsService.resolveInstitutionHierarchy(
            dbClient,
            activeInstitutionId,
        );
        scopingInstitutionId = hierarchy.scopingInstitutionId;
        scopingBranchId = hierarchy.scopingBranchId;
    }

    // Security Check: enforce child branch data boundaries strictly
    if (scopingBranchId && query.branchId && query.branchId !== scopingBranchId) {
        throw new HTTPException(403, {
            message:
                'Access denied: You are only authorized to access logs for your assigned branch.',
        });
    }

    const effectiveBranchId = scopingBranchId || query.branchId || null;

    const data = await SystemLogsService.getSystemLogs(
        dbClient,
        scopingInstitutionId,
        effectiveBranchId,
        query,
    );

    return c.json({
        message: 'System logs fetched successfully',
        data,
    });
};
