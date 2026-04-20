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

const monitoringRoutes = new OpenAPIHono<HonoEnv>();

monitoringRoutes.use('*', authMiddleware);

monitoringRoutes
    .openapi(getExamMonitoringOverviewRoute, getExamMonitoringOverviewRouteHandler)
    .openapi(getExamMonitoringStudentRoute, getExamMonitoringStudentRouteHandler);

export default monitoringRoutes;
