import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { startLiveInspectionSchema } from '../live-inspection.dto';
import { startLiveInspection } from '../services/start-live-inspection.service';

export const startLiveInspectionRoute = createRoute({
    method: 'post',
    path: '/:examId/monitoring/live-inspections',
    tags: ['Live Inspection'],
    request: {
        params: startLiveInspectionSchema.params,
        body: { content: { 'application/json': { schema: startLiveInspectionSchema.body } } },
    },
    responses: {
        201: {
            description: 'Live inspection lease started',
            content: { 'application/json': { schema: startLiveInspectionSchema.response } },
        },
    },
});

export const startLiveInspectionRouteHandler: AppRouteHandler<
    typeof startLiveInspectionRoute
> = async (c) => {
    const { examId } = c.req.valid('param');
    const { attemptId, restart } = c.req.valid('json');
    const status = await startLiveInspection({
        dbClient: c.get('dbClient'),
        examId,
        attemptId,
        restart,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Live inspection started.', data: status }, 201);
};
