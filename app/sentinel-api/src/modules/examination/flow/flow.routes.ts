import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';

import {
    completeSessionRoute,
    completeSessionRouteHandler,
} from './controllers/complete-session.controller';
import {
    startSessionRoute,
    startSessionRouteHandler,
} from './controllers/start-session.controller';
import { authMiddleware } from '../../../middleware/auth';

const flowRoutes = new OpenAPIHono<HonoEnv>();

flowRoutes.use('*', authMiddleware);

flowRoutes
    .openapi(startSessionRoute, startSessionRouteHandler)
    .openapi(completeSessionRoute, completeSessionRouteHandler);

export default flowRoutes;
