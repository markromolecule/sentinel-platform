import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';

import {
    ingestProctoringEventRoute,
    ingestProctoringEventRouteHandler,
} from './controllers/ingest-event.controller';
import {
    ingestBatchProctoringEventRoute,
    ingestBatchProctoringEventRouteHandler,
} from './controllers/ingest-batch.controller';
import {
    flushTelemetryRoute,
    flushTelemetryRouteHandler,
} from './controllers/flush-telemetry.controller';
import { authMiddleware } from '../../../middleware/auth';

const telemetryIngestionRoutes = new OpenAPIHono<HonoEnv>();

// Internal flush route (uses its own secret auth)
telemetryIngestionRoutes.openapi(flushTelemetryRoute, flushTelemetryRouteHandler);

// Public student ingestion routes (require authMiddleware)
const authenticatedRoutes = new OpenAPIHono<HonoEnv>();
authenticatedRoutes.use('*', authMiddleware);

authenticatedRoutes.openapi(ingestProctoringEventRoute, ingestProctoringEventRouteHandler);
authenticatedRoutes.openapi(ingestBatchProctoringEventRoute, ingestBatchProctoringEventRouteHandler);

telemetryIngestionRoutes.route('/', authenticatedRoutes);

export default telemetryIngestionRoutes;
