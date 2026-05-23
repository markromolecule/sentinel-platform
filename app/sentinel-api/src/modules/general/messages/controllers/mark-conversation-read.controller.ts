import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { markConversationReadSchema } from '../messages.dto';
import { MessagesService } from '../messages.service';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';

export const markConversationReadRoute = createRoute({
    method: 'post',
    path: '/conversations/{conversationId}/read',
    tags: ['Messages'],
    summary: 'Mark conversation as read',
    description: 'Updates the last read timestamp for the authenticated participant.',
    request: {
        params: markConversationReadSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: markConversationReadSchema.response,
                },
            },
            description: 'Conversation marked as read successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const markConversationReadRouteHandler: AppRouteHandler<
    typeof markConversationReadRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'messages:view',
            'Forbidden. You do not have permission to view messages.',
        );

        const user = c.get('user');
        const { conversationId } = c.req.valid('param');

        const result = await MessagesService.markConversationRead(c.get('dbClient'), {
            conversationId,
            userId: user.id,
        });

        return c.json(
            {
                success: true,
                message: 'Conversation marked as read successfully',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Mark conversation read error:');
    }
};
