import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getConversationsSchema } from '../messages.dto';
import { MessagesService } from '../messages.service';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';

export const getConversationsRoute = createRoute({
    method: 'get',
    path: '/conversations',
    tags: ['Messages'],
    summary: 'List user conversations',
    description: 'Retrieves all active conversations for the authenticated user.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getConversationsSchema.response,
                },
            },
            description: 'Conversations fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getConversationsRouteHandler: AppRouteHandler<typeof getConversationsRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'messages:view',
            'Forbidden. You do not have permission to view messages.',
        );

        const user = c.get('user');
        const conversations = await MessagesService.listConversations(c.get('dbClient'), {
            userId: user.id,
        });

        return c.json(
            {
                success: true,
                message: 'Conversations fetched successfully',
                data: conversations,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get conversations error:');
    }
};
