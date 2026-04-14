import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    getTelemetryIncidentRoute,
    getTelemetryIncidentRouteHandler,
} from './controllers/get-incident.controller';
import {
    getTelemetryIncidentsRoute,
    getTelemetryIncidentsRouteHandler,
} from './controllers/get-incidents.controller';
import {
    updateTelemetryIncidentRoute,
    updateTelemetryIncidentRouteHandler,
} from './controllers/update-incident.controller';

const telemetryStorageRoutes = new OpenAPIHono<HonoEnv>();

telemetryStorageRoutes.use('*', authMiddleware);

telemetryStorageRoutes
    .openapi(getTelemetryIncidentsRoute, getTelemetryIncidentsRouteHandler)
    .openapi(getTelemetryIncidentRoute, getTelemetryIncidentRouteHandler)
    .openapi(updateTelemetryIncidentRoute, updateTelemetryIncidentRouteHandler);

export default telemetryStorageRoutes;
