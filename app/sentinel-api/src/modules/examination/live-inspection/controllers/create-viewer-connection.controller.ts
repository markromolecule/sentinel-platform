import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { createViewerConnectionSchema } from '../live-inspection.dto';
import { createViewerConnection } from '../services/create-viewer-connection.service';

export const createViewerConnectionRoute = createRoute({
    method: 'post',
    path: '/:examId/monitoring/live-inspections/:leaseId/viewer-connection',
    tags: ['Live Inspection'],
    request: { params: createViewerConnectionSchema.params },
    responses: {
        200: {
            description: 'Viewer LiveKit connection credentials',
            content: { 'application/json': { schema: createViewerConnectionSchema.response } },
        },
    },
});

export const createViewerConnectionRouteHandler: AppRouteHandler<
    typeof createViewerConnectionRoute
> = async (c) => {
    const { examId, leaseId } = c.req.valid('param');
    const credentials = await createViewerConnection({
        dbClient: c.get('dbClient'),
        examId,
        leaseId,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Viewer connection created.', data: credentials });
};
