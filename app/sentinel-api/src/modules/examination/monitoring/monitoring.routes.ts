import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getExamMonitoringOverviewRoute,
    getExamMonitoringOverviewRouteHandler,
} from './controllers/get-exam-monitoring-overview.controller';
import {
    getExamMonitoringStudentRoute,
    getExamMonitoringStudentRouteHandler,
} from './controllers/get-exam-monitoring-student.controller';

export function registerMonitoringRoutes(app: OpenAPIHono<HonoEnv>) {
    app.openapi(getExamMonitoringOverviewRoute, getExamMonitoringOverviewRouteHandler);
    app.openapi(getExamMonitoringStudentRoute, getExamMonitoringStudentRouteHandler);
}
