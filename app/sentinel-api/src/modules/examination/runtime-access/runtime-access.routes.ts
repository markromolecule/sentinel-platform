import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    updateExamRuntimeAccessRoute,
    updateExamRuntimeAccessRouteHandler,
} from './controllers/update-exam-runtime-access.controller';

export function registerRuntimeAccessRoutes(app: OpenAPIHono<HonoEnv>) {
    app.openapi(updateExamRuntimeAccessRoute, updateExamRuntimeAccessRouteHandler);
}
