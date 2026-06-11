import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import { createExamRoute, createExamRouteHandler } from './controllers/create-exam.controller';
import { deleteExamRoute, deleteExamRouteHandler } from './controllers/delete-exam.controller';
import { getExamRoute, getExamRouteHandler } from './controllers/get-exam.controller';
import { getExamsRoute, getExamsRouteHandler } from './controllers/get-exams.controller';
import { updateExamRoute, updateExamRouteHandler } from './controllers/update-exam.controller';
import {
    updateExamStatusRoute,
    updateExamStatusRouteHandler,
} from './controllers/update-exam-status.controller';
import { registerMonitoringRoutes } from '../monitoring/monitoring.routes';
import { registerReportingRoutes } from '../reporting/reporting.routes';
import { registerRuntimeAccessRoutes } from '../runtime-access/runtime-access.routes';
import { registerStudentOverridesRoutes } from '../student-overrides/student-overrides.routes';
import { registerLobbyRoutes } from '../lobby/lobby.routes';
import { registerIncidentsRoutes } from '../incidents/incidents.routes';

const examsRoutes = new OpenAPIHono<HonoEnv>();

examsRoutes.use('*', authMiddleware);

registerMonitoringRoutes(examsRoutes);
registerReportingRoutes(examsRoutes);
registerRuntimeAccessRoutes(examsRoutes);
registerStudentOverridesRoutes(examsRoutes);
registerLobbyRoutes(examsRoutes);
registerIncidentsRoutes(examsRoutes);

examsRoutes
    .openapi(getExamsRoute, getExamsRouteHandler)
    .openapi(getExamRoute, getExamRouteHandler)
    .openapi(createExamRoute, createExamRouteHandler)
    .openapi(updateExamRoute, updateExamRouteHandler)
    .openapi(deleteExamRoute, deleteExamRouteHandler)
    .openapi(updateExamStatusRoute, updateExamStatusRouteHandler);

export default examsRoutes;
