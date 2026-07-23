import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { ingestProctoringEventSchema } from '../ingestion.dto';
import { TelemetryService } from '../../telemetry.service';

export const ingestProctoringEventRoute = createRoute({
    method: 'post',
    path: '/events',
    tags: ['Telemetry'],
    summary: 'Ingest Proctoring Event',
    description:
        'Fast-path ingestion endpoint for lightweight proctoring events (e.g. gaze off screen). Bloated or unmapped schemas are stripped/rejected.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: ingestProctoringEventSchema.body,
                },
            },
        },
    },
    responses: {
        202: {
            content: {
                'application/json': {
                    schema: ingestProctoringEventSchema.response,
                },
            },
            description: 'Event accepted for background processing and storage',
        },
        400: {
            description: 'Bad Request - payload failed strict validation',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const ingestProctoringEventRouteHandler: AppRouteHandler<
    typeof ingestProctoringEventRoute
> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');

        if (body.studentId !== user.id) {
            throw new HTTPException(403, {
                message: 'Telemetry payload student does not match the authenticated user.',
            });
        }

        const result = await TelemetryService.ingestEvent(c.get('dbClient'), body);

        return c.json(
            {
                message: 'Event accepted for processing',
                data: result
                    ? {
                          mode: result.mode,
                          jobId: result.jobId,
                      }
                    : null,
            },
            202,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Ingest Proctoring Event Error:');
    }
};
