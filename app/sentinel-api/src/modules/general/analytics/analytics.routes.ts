import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getAnalyticsKPIsRoute,
    getAnalyticsKPIsRouteHandler,
} from './controllers/get-analytics-kpis.controller';
import {
    getAnalyticsIncidentSeverityRoute,
    getAnalyticsIncidentSeverityRouteHandler,
} from './controllers/get-analytics-incident-severity.controller';
import {
    getAnalyticsIncidentTypeRoute,
    getAnalyticsIncidentTypeRouteHandler,
} from './controllers/get-analytics-incident-type.controller';
import {
    getAnalyticsDepartmentIntegrityRoute,
    getAnalyticsDepartmentIntegrityRouteHandler,
} from './controllers/get-analytics-department-integrity.controller';
import {
    getAnalyticsReportsRoute,
    getAnalyticsReportsRouteHandler,
} from './controllers/get-analytics-reports.controller';
import {
    generateAnalyticsReportRoute,
    generateAnalyticsReportRouteHandler,
} from './controllers/generate-analytics-report.controller';

const analyticsRoutes = new OpenAPIHono<HonoEnv>();

analyticsRoutes.use('*', authMiddleware);

analyticsRoutes
    .openapi(getAnalyticsKPIsRoute, getAnalyticsKPIsRouteHandler)
    .openapi(getAnalyticsIncidentSeverityRoute, getAnalyticsIncidentSeverityRouteHandler)
    .openapi(getAnalyticsIncidentTypeRoute, getAnalyticsIncidentTypeRouteHandler)
    .openapi(getAnalyticsDepartmentIntegrityRoute, getAnalyticsDepartmentIntegrityRouteHandler)
    .openapi(getAnalyticsReportsRoute, getAnalyticsReportsRouteHandler)
    .openapi(generateAnalyticsReportRoute, generateAnalyticsReportRouteHandler);

export default analyticsRoutes;
