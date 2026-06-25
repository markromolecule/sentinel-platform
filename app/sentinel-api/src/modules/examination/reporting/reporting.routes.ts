import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getAttemptReportRoute,
    getAttemptReportRouteHandler,
} from './controllers/get-attempt-report.controller';
import {
    getExamReportRoute,
    getExamReportRouteHandler,
} from './controllers/get-exam-report.controller';

export function registerReportingRoutes(app: OpenAPIHono<HonoEnv>) {
    app.openapi(getExamReportRoute, getExamReportRouteHandler).openapi(
        getAttemptReportRoute,
        getAttemptReportRouteHandler,
    );
}
