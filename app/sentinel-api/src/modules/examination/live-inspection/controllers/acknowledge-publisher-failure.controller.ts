import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { acknowledgePublisherFailureSchema } from '../live-inspection.dto';
import { acknowledgePublisherFailure } from '../services/acknowledge-publisher-failure.service';

export const acknowledgePublisherFailureRoute = createRoute({
    method: 'post',
    path: '/live-inspections/publisher-failure',
    tags: ['Live Inspection'],
    request: {
        body: {
            content: { 'application/json': { schema: acknowledgePublisherFailureSchema.body } },
        },
    },
    responses: {
        200: {
            description: 'Publisher failure acknowledged',
            content: { 'application/json': { schema: acknowledgePublisherFailureSchema.response } },
        },
    },
});

export const acknowledgePublisherFailureRouteHandler: AppRouteHandler<
    typeof acknowledgePublisherFailureRoute
> = async (c) => {
    const body = c.req.valid('json');
    const ack = await acknowledgePublisherFailure({
        dbClient: c.get('dbClient'),
        sessionId: body.sessionId,
        leaseId: body.leaseId,
        revision: body.revision,
        errorCode: body.errorCode,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Publisher failure acknowledged.', data: ack });
};
