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
import {
    getExamSharesRoute,
    getExamSharesRouteHandler,
    shareExamRoute,
    shareExamRouteHandler,
    unshareExamRoute,
    unshareExamRouteHandler,
} from './controllers/exam-sharing.controller';
import { registerMonitoringRoutes } from '../monitoring/monitoring.routes';
import { registerReportingRoutes } from '../reporting/reporting.routes';
import { registerRuntimeAccessRoutes } from '../runtime-access/runtime-access.routes';
import { registerStudentOverridesRoutes } from '../student-overrides/student-overrides.routes';
import { registerLobbyRoutes } from '../lobby/lobby.routes';
import { registerIncidentsRoutes } from '../incidents/incidents.routes';
import { registerLifecycleRoutes } from '../lifecycle/lifecycle.routes';
import sectionAssignmentsRouter from '../section-assignments/section-assignments.route';

const examsRoutes = new OpenAPIHono<HonoEnv>();

examsRoutes.use('*', authMiddleware);

registerMonitoringRoutes(examsRoutes);
registerReportingRoutes(examsRoutes);
registerRuntimeAccessRoutes(examsRoutes);
registerStudentOverridesRoutes(examsRoutes);
registerLobbyRoutes(examsRoutes);
registerIncidentsRoutes(examsRoutes);
registerLifecycleRoutes(examsRoutes);

examsRoutes.route('/:examId/section-assignments', sectionAssignmentsRouter);

examsRoutes
    .openapi(getExamsRoute, getExamsRouteHandler)
    .openapi(getExamRoute, getExamRouteHandler)
    .openapi(createExamRoute, createExamRouteHandler)
    .openapi(updateExamRoute, updateExamRouteHandler)
    .openapi(deleteExamRoute, deleteExamRouteHandler)
    .openapi(updateExamStatusRoute, updateExamStatusRouteHandler)
    .openapi(getExamSharesRoute, getExamSharesRouteHandler)
    .openapi(shareExamRoute, shareExamRouteHandler)
    .openapi(unshareExamRoute, unshareExamRouteHandler);

export default examsRoutes;
