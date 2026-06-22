import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { completeSessionSchema } from '../flow.dto';
import { SessionManagerService } from '../flow.service';
import { resolveAssessmentActorRole } from '../../assessment/assessment-access';

export const completeSessionRoute = createRoute({
    method: 'post',
    path: '/complete',
    tags: ['Examination Flow'],
    summary: 'Complete an Exam Session',
    description: 'Finalizes a student exam attempt and stores the scored result.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: completeSessionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: completeSessionSchema.response,
                },
            },
            description: 'Session completed successfully',
        },
        403: {
            description: 'Forbidden - Only students can complete a session',
        },
        404: {
            description: 'Exam session not found',
        },
        409: {
            description: 'Exam session already completed',
        },
    },
});

export const completeSessionRouteHandler: AppRouteHandler<typeof completeSessionRoute> = async (
    c,
) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = await resolveAssessmentActorRole({
            dbClient: c.get('dbClient'),
            userId: user?.id,
            claimedRole: supabaseUser?.user_metadata?.role,
        });

        if (role !== 'student' || !user?.id) {
            throw new HTTPException(403, {
                message: 'Forbidden. Only students can complete exam sessions.',
            });
        }

        const result = await SessionManagerService.completeSession(
            c.get('dbClient'),
            user.id,
            body,
        );

        return c.json(
            {
                message: 'Session completed successfully',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Complete Session Error:');
    }
};
