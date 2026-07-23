import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { stopLiveInspectionSchema } from '../live-inspection.dto';
import { stopLiveInspection } from '../services/stop-live-inspection.service';

export const stopLiveInspectionRoute = createRoute({
    method: 'post',
    path: '/:examId/monitoring/live-inspections/:leaseId/stop',
    tags: ['Live Inspection'],
    request: { params: stopLiveInspectionSchema.params },
    responses: {
        200: {
            description: 'Live inspection stopped',
            content: { 'application/json': { schema: stopLiveInspectionSchema.response } },
        },
    },
});

export const stopLiveInspectionRouteHandler: AppRouteHandler<
    typeof stopLiveInspectionRoute
> = async (c) => {
    const { examId, leaseId } = c.req.valid('param');
    const status = await stopLiveInspection({
        dbClient: c.get('dbClient'),
        examId,
        leaseId,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Live inspection stopped.', data: status });
};
