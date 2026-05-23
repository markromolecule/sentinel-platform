import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { sendMessageSchema } from '../messages.dto';
import { MessagesService } from '../messages.service';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';

export const sendMessageRoute = createRoute({
    method: 'post',
    path: '/conversations/{conversationId}/messages',
    tags: ['Messages'],
    summary: 'Send a message',
    description: 'Posts a new message to a specific conversation.',
    request: {
        params: sendMessageSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: sendMessageSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: sendMessageSchema.response,
                },
            },
            description: 'Message sent successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const sendMessageRouteHandler: AppRouteHandler<typeof sendMessageRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'messages:create',
            'Forbidden. You do not have permission to send messages.',
        );

        const user = c.get('user');
        const { conversationId } = c.req.valid('param');
        const { content } = c.req.valid('json');

        const message = await MessagesService.sendMessage(c.get('dbClient'), {
            conversationId,
            senderId: user.id,
            content,
        });

        return c.json(
            {
                success: true,
                message: 'Message sent successfully',
                data: message,
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Send message error:');
    }
};
