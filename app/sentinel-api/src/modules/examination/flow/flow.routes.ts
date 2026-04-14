import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';

import {
    startSessionRoute,
    startSessionRouteHandler,
} from './controllers/start-session.controller';
import { authMiddleware } from '../../../middleware/auth';

const flowRoutes = new OpenAPIHono<HonoEnv>();

flowRoutes.use('*', authMiddleware);

flowRoutes.openapi(startSessionRoute, startSessionRouteHandler);

export default flowRoutes;
