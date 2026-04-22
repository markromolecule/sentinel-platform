import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../types/hono';
import telemetryIngestionRoutes from './ingestion/ingestion.routes';
import telemetrySettingsRoutes from './settings/settings.routes';
import telemetryStorageRoutes from './storage/storage.routes';
import {
    telemetryHealthRoute,
    telemetryHealthRouteHandler,
} from './telemetry-monitoring.controller';

const telemetryRoutes = new OpenAPIHono<HonoEnv>();

telemetryRoutes.openapi(telemetryHealthRoute, telemetryHealthRouteHandler);
telemetryRoutes.route('/', telemetryIngestionRoutes);
telemetryRoutes.route('/', telemetrySettingsRoutes);
telemetryRoutes.route('/', telemetryStorageRoutes);

export default telemetryRoutes;
