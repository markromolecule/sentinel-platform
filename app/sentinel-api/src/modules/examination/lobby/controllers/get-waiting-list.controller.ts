import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
} from '../../assessment/assessment-access';
import { getWaitingListSchema } from '../lobby.dto';
import { LobbyService } from '../lobby.service';

export const getWaitingListRoute = createRoute({
    method: 'get',
    path: '/:id/lobby/waiting-list',
    tags: ['Lobby'],
    summary: 'Instructor gets the waiting list of students',
    request: {
        params: getWaitingListSchema.params,
    },
    responses: {
        200: {
            description: 'Waiting list retrieved successfully',
            content: {
                'application/json': {
                    schema: getWaitingListSchema.response,
                },
            },
        },
    },
});

export const getWaitingListRouteHandler: AppRouteHandler<typeof getWaitingListRoute> = async (
    c,
) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);

    const result = await LobbyService.getWaitingList(c.get('dbClient'), id);

    return c.json({
        message: 'Waiting list retrieved successfully',
        data: result,
    });
};
