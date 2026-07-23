import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { acknowledgePublisherReadySchema } from '../live-inspection.dto';
import { acknowledgePublisherReady } from '../services/acknowledge-publisher-ready.service';

export const acknowledgePublisherReadyRoute = createRoute({
    method: 'post',
    path: '/live-inspections/publisher-ready',
    tags: ['Live Inspection'],
    request: {
        body: { content: { 'application/json': { schema: acknowledgePublisherReadySchema.body } } },
    },
    responses: {
        200: {
            description: 'Publisher ready acknowledged',
            content: { 'application/json': { schema: acknowledgePublisherReadySchema.response } },
        },
    },
});

export const acknowledgePublisherReadyRouteHandler: AppRouteHandler<
    typeof acknowledgePublisherReadyRoute
> = async (c) => {
    const body = c.req.valid('json');
    const ack = await acknowledgePublisherReady({
        dbClient: c.get('dbClient'),
        sessionId: body.sessionId,
        leaseId: body.leaseId,
        revision: body.revision,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Publisher ready acknowledged.', data: ack });
};
