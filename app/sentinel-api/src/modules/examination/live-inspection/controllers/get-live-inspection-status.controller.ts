import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getLiveInspectionStatusSchema } from '../live-inspection.dto';
import { getLiveInspectionStatus } from '../services/get-live-inspection-status.service';

export const getLiveInspectionStatusRoute = createRoute({
    method: 'get',
    path: '/:examId/monitoring/live-inspections/status',
    tags: ['Live Inspection'],
    request: {
        params: getLiveInspectionStatusSchema.params,
        query: getLiveInspectionStatusSchema.query,
    },
    responses: {
        200: {
            description: 'Live inspection status',
            content: { 'application/json': { schema: getLiveInspectionStatusSchema.response } },
        },
    },
});

export const getLiveInspectionStatusRouteHandler: AppRouteHandler<
    typeof getLiveInspectionStatusRoute
> = async (c) => {
    const { examId } = c.req.valid('param');
    const { attemptId, leaseId } = c.req.valid('query');
    const status = await getLiveInspectionStatus({
        dbClient: c.get('dbClient'),
        examId,
        attemptId,
        leaseId,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Live inspection status fetched.', data: status });
};
