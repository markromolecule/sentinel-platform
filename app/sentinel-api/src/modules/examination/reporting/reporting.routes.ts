import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getExamReportRoute,
    getExamReportRouteHandler,
} from './controllers/get-exam-report.controller';

export function registerReportingRoutes(app: OpenAPIHono<HonoEnv>) {
    app.openapi(getExamReportRoute, getExamReportRouteHandler);
}
