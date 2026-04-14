import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { ingestBatchProctoringEventSchema } from '../ingestion.dto';
import { TelemetryIngestionService } from '../ingestion.service';

export const ingestBatchProctoringEventRoute = createRoute({
    method: 'post',
    path: '/events/batch',
    tags: ['Telemetry'],
    summary: 'Ingest Batch Proctoring Events',
    description:
        'Fast-path batch ingestion endpoint for lightweight proctoring events. Events are buffered in Redis for high-throughput processing.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: ingestBatchProctoringEventSchema.body,
                },
            },
        },
    },
    responses: {
        202: {
            content: {
                'application/json': {
                    schema: ingestBatchProctoringEventSchema.response,
                },
            },
            description: 'Batch accepted for buffering and background storage',
        },
        400: {
            description: 'Bad Request - payload failed strict validation',
        },
        403: {
            description: 'Forbidden - student mismatch detected in batch',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const ingestBatchProctoringEventRouteHandler: AppRouteHandler<
    typeof ingestBatchProctoringEventRoute
> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');

        // Validate that all events in the batch belong to the authenticated student
        const hasMismatch = body.some((event) => event.studentId !== user.id);
        if (hasMismatch) {
            throw new HTTPException(403, {
                message: 'One or more events in the batch do not match the authenticated user.',
            });
        }

        // Process the batch (policy filtering -> Redis buffering)
        await TelemetryIngestionService.processBatch(c.get('dbClient'), body);

        return c.json(
            {
                message: 'Batch accepted for processing',
                data: null,
            },
            202,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Ingest Batch Proctoring Event Error:');
    }
};
