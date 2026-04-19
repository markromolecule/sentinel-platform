import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getExamHistoryDetailRoute,
    getExamHistoryDetailRouteHandler,
} from './controllers/get-exam-history-detail.controller';
import {
    getExamHistoryRoute,
    getExamHistoryRouteHandler,
} from './controllers/get-exam-history.controller';

const historyRoutes = new OpenAPIHono<HonoEnv>();

historyRoutes.use('*', authMiddleware);

historyRoutes
    .openapi(getExamHistoryRoute, getExamHistoryRouteHandler)
    .openapi(getExamHistoryDetailRoute, getExamHistoryDetailRouteHandler);

export default historyRoutes;
