import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import { getAuthLogsRoute, getAuthLogsRouteHandler } from './controllers/get-auth-logs.controller';
import { getActivityLogsRoute, getActivityLogsRouteHandler } from './controllers/get-activity-logs.controller';
import { getSystemLogsRoute, getSystemLogsRouteHandler } from './controllers/get-system-logs.controller';

const logsRoutes = new OpenAPIHono<HonoEnv>();

// Require authentication for all system logs query operations
logsRoutes.use('*', authMiddleware);

logsRoutes
    .openapi(getAuthLogsRoute, getAuthLogsRouteHandler)
    .openapi(getActivityLogsRoute, getActivityLogsRouteHandler)
    .openapi(getSystemLogsRoute, getSystemLogsRouteHandler);

export default logsRoutes;
