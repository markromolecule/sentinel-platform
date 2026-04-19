import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getGradingExamsRoute,
    getGradingExamsRouteHandler,
} from './controllers/get-grading-exams.controller';
import {
    getGradingStudentsRoute,
    getGradingStudentsRouteHandler,
} from './controllers/get-grading-students.controller';

const gradingRoutes = new OpenAPIHono<HonoEnv>();

gradingRoutes.use('*', authMiddleware);

gradingRoutes
    .openapi(getGradingExamsRoute, getGradingExamsRouteHandler)
    .openapi(getGradingStudentsRoute, getGradingStudentsRouteHandler);

export default gradingRoutes;
