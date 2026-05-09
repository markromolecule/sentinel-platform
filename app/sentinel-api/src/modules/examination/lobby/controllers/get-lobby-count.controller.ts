import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getLobbyCountSchema } from '../lobby.dto';
import { LobbyService } from '../lobby.service';

export const getLobbyCountRoute = createRoute({
    method: 'get',
    path: '/:id/lobby/count',
    tags: ['Lobby'],
    summary: 'Gets the current exam lobby count',
    request: {
        params: getLobbyCountSchema.params,
    },
    responses: {
        200: {
            description: 'Lobby count retrieved successfully',
            content: {
                'application/json': {
                    schema: getLobbyCountSchema.response,
                },
            },
        },
    },
});

export const getLobbyCountRouteHandler: AppRouteHandler<typeof getLobbyCountRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const supabaseUser = c.get('supabaseUser') as any;
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);

    const result = await LobbyService.getLobbyCount(
        c.get('dbClient'),
        id,
        user.id,
        resolveAssessmentInstitutionId({
            role: resolvedRole,
            contextInstitutionId: c.get('institutionId'),
        }),
    );

    return c.json({
        message: 'Lobby count retrieved successfully',
        data: result,
    });
};
