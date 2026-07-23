import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { startSessionSchema } from '../flow.dto';
import { SessionManagerService } from '../flow.service';

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
        409: {
            description: 'Conflict - Latest student attempt is already turned in',
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

        const {
            sessionId,
            configSnapshot,
            isResumed,
            error,
            errorCode,
            attemptId,
            answers,
            elapsedSeconds,
            reconnectAttemptCount,
            maxReconnectAttempts,
        } = await SessionManagerService.startSession(
            c.get('dbClient'),
            user.id,
            body.examId,
            body.resumeRequestId,
        );

        if (error) {
            const status = errorCode === 'ATTEMPT_ALREADY_COMPLETED' ? 409 : 403;

            return c.json(
                {
                    message:
                        errorCode === 'ATTEMPT_ALREADY_COMPLETED'
                            ? 'Session already completed'
                            : 'Access denied',
                    data: {
                        attemptId,
                        error,
                        errorCode,
                    },
                },
                status,
            );
        }

        return c.json(
            {
                message: 'Session initiated safely',
                data: {
                    sessionId,
                    configSnapshot,
                    isResumed,
                    attemptId,
                    answers,
                    elapsedSeconds,
                    reconnectAttemptCount,
                    maxReconnectAttempts,
                },
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Start Session Error:');
    }
};
