import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    createFeedbackRoute,
    createFeedbackRouteHandler,
} from './controllers/create-feedback.controller';
import { getFeedbackRoute, getFeedbackRouteHandler } from './controllers/get-feedback.controller';
import {
    getFeedbacksRoute,
    getFeedbacksRouteHandler,
} from './controllers/get-feedbacks.controller';

const feedbackRoutes = new OpenAPIHono<HonoEnv>();

feedbackRoutes.use('*', authMiddleware);

feedbackRoutes
    .openapi(createFeedbackRoute, createFeedbackRouteHandler)
    .openapi(getFeedbackRoute, getFeedbackRouteHandler)
    .openapi(getFeedbacksRoute, getFeedbacksRouteHandler);

export default feedbackRoutes;
