import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { startSessionSchema } from '../flow.dto';
import { SessionManagerService } from '../services/session-manager.service';

export const startSessionRoute = createRoute({
    method: 'post',
    path: '/start',
    tags: ['Examination Flow'],
    summary: 'Start an Exam Session',
    description: 'Initializes a session after checking access permissions.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: startSessionSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: startSessionSchema.response,
                },
            },
            description: 'Session started successfully',
        },
        403: {
            description: 'Forbidden - Access requirements not met',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const startSessionRouteHandler: AppRouteHandler<typeof startSessionRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');

        const { sessionId, configSnapshot, isResumed, error } =
            await SessionManagerService.startSession(c.get('dbClient'), user.id, body.examId);

        if (error) {
            return c.json({ message: 'Access denied', data: { error } }, 403);
        }

        return c.json(
            {
                message: 'Session initiated safely',
                data: {
                    sessionId,
                    configSnapshot,
                    isResumed,
                },
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Start Session Error:');
    }
};
