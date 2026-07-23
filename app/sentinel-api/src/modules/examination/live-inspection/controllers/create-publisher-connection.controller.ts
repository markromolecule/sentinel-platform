import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { createPublisherConnectionSchema } from '../live-inspection.dto';
import { createPublisherConnection } from '../services/create-publisher-connection.service';

export const createPublisherConnectionRoute = createRoute({
    method: 'post',
    path: '/live-inspections/publisher-connection',
    tags: ['Live Inspection'],
    request: {
        body: { content: { 'application/json': { schema: createPublisherConnectionSchema.body } } },
    },
    responses: {
        200: {
            description: 'Publisher LiveKit connection credentials',
            content: { 'application/json': { schema: createPublisherConnectionSchema.response } },
        },
    },
});

export const createPublisherConnectionRouteHandler: AppRouteHandler<
    typeof createPublisherConnectionRoute
> = async (c) => {
    const body = c.req.valid('json');
    const credentials = await createPublisherConnection({
        dbClient: c.get('dbClient'),
        sessionId: body.sessionId,
        leaseId: body.leaseId,
        revision: body.revision,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Publisher connection created.', data: credentials });
};
