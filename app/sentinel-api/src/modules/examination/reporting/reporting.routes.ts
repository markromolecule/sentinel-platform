import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getExamReportRoute,
    getExamReportRouteHandler,
} from './controllers/get-exam-report.controller';

const reportingRoutes = new OpenAPIHono<HonoEnv>();

reportingRoutes.use('*', authMiddleware);

reportingRoutes.openapi(getExamReportRoute, getExamReportRouteHandler);

export default reportingRoutes;
