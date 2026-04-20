import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    updateExamRuntimeAccessRoute,
    updateExamRuntimeAccessRouteHandler,
} from './controllers/update-exam-runtime-access.controller';

const runtimeAccessRoutes = new OpenAPIHono<HonoEnv>();

runtimeAccessRoutes.use('*', authMiddleware);

runtimeAccessRoutes.openapi(updateExamRuntimeAccessRoute, updateExamRuntimeAccessRouteHandler);

export default runtimeAccessRoutes;
