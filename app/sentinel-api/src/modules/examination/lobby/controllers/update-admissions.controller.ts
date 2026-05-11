import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { updateAdmissionsSchema } from '../lobby.dto';
import { LobbyService } from '../lobby.service';

export const updateAdmissionsRoute = createRoute({
    method: 'patch',
    path: '/:id/lobby/admissions',
    tags: ['Lobby'],
    summary: 'Instructor approves or rejects students in the lobby',
    request: {
        params: updateAdmissionsSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateAdmissionsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Admissions updated successfully',
            content: {
                'application/json': {
                    schema: updateAdmissionsSchema.response,
                },
            },
        },
    },
});

export const updateAdmissionsRouteHandler: AppRouteHandler<typeof updateAdmissionsRoute> = async (
    c,
) => {
    const { id } = c.req.valid('param');
    const { studentIds, status } = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);
    const role = resolvedRole as AssessmentAllowedRole;

    const result = await LobbyService.updateAdmissions(
        c.get('dbClient'),
        id,
        studentIds,
        status,
        user.id,
        role,
        resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
    );

    return c.json({
        message: 'Admissions updated successfully',
        data: result,
    });
};
