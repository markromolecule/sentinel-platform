import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getConversationMessagesSchema } from '../messages.dto';
import { MessagesService } from '../messages.service';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';

export const getConversationMessagesRoute = createRoute({
    method: 'get',
    path: '/conversations/{conversationId}/messages',
    tags: ['Messages'],
    summary: 'Get conversation messages',
    description: 'Retrieves all messages in a conversation for authorized participants.',
    request: {
        params: getConversationMessagesSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getConversationMessagesSchema.response,
                },
            },
            description: 'Messages fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getConversationMessagesRouteHandler: AppRouteHandler<
    typeof getConversationMessagesRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'messages:view',
            'Forbidden. You do not have permission to view messages.',
        );

        const user = c.get('user');
        const { conversationId } = c.req.valid('param');

        const messages = await MessagesService.listConversationMessages(c.get('dbClient'), {
            conversationId,
            userId: user.id,
        });

        return c.json(
            {
                success: true,
                message: 'Messages fetched successfully',
                data: messages,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get conversation messages error:');
    }
};
