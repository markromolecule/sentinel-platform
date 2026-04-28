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
import monitoringRoutes from '../monitoring/monitoring.routes';
import reportingRoutes from '../reporting/reporting.routes';
import runtimeAccessRoutes from '../runtime-access/runtime-access.routes';
import studentOverridesRoutes from '../student-overrides/student-overrides.routes';
import lobbyRoutes from '../lobby/lobby.routes';

const examsRoutes = new OpenAPIHono<HonoEnv>();

examsRoutes.use('*', authMiddleware);
examsRoutes.route('/', monitoringRoutes);
examsRoutes.route('/', reportingRoutes);
examsRoutes.route('/', runtimeAccessRoutes);
examsRoutes.route('/', studentOverridesRoutes);
examsRoutes.route('/', lobbyRoutes);

examsRoutes
    .openapi(getExamsRoute, getExamsRouteHandler)
    .openapi(getExamRoute, getExamRouteHandler)
    .openapi(createExamRoute, createExamRouteHandler)
    .openapi(updateExamRoute, updateExamRouteHandler)
    .openapi(deleteExamRoute, deleteExamRouteHandler)
    .openapi(updateExamStatusRoute, updateExamStatusRouteHandler);

export default examsRoutes;
