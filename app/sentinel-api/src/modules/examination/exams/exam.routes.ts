import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import { createExamRoute, createExamRouteHandler } from './controllers/create-exam.controller';
import { deleteExamRoute, deleteExamRouteHandler } from './controllers/delete-exam.controller';
import { getExamRoute, getExamRouteHandler } from './controllers/get-exam.controller';
import {
    getExamHistoryDetailRoute,
    getExamHistoryDetailRouteHandler,
} from './controllers/get-exam-history-detail.controller';
import {
    getExamHistoryRoute,
    getExamHistoryRouteHandler,
} from './controllers/get-exam-history.controller';
import { getExamsRoute, getExamsRouteHandler } from './controllers/get-exams.controller';
import { updateExamRoute, updateExamRouteHandler } from './controllers/update-exam.controller';
import {
    updateExamStatusRoute,
    updateExamStatusRouteHandler,
} from './controllers/update-exam-status.controller';

const examsRoutes = new OpenAPIHono<HonoEnv>();

examsRoutes.use('*', authMiddleware);

examsRoutes
    .openapi(getExamsRoute, getExamsRouteHandler)
    .openapi(getExamHistoryRoute, getExamHistoryRouteHandler)
    .openapi(getExamHistoryDetailRoute, getExamHistoryDetailRouteHandler)
    .openapi(getExamRoute, getExamRouteHandler)
    .openapi(createExamRoute, createExamRouteHandler)
    .openapi(updateExamRoute, updateExamRouteHandler)
    .openapi(deleteExamRoute, deleteExamRouteHandler)
    .openapi(updateExamStatusRoute, updateExamStatusRouteHandler);

export default examsRoutes;
