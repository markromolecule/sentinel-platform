import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    createQuestionRoute,
    createQuestionRouteHandler,
} from './controllers/create-question.controller';
import {
    deleteQuestionRoute,
    deleteQuestionRouteHandler,
} from './controllers/delete-question.controller';
import { getQuestionRoute, getQuestionRouteHandler } from './controllers/get-question.controller';
import {
    getQuestionTypeCountsRoute,
    getQuestionTypeCountsRouteHandler,
} from './controllers/get-question-type-counts.controller';
import {
    getQuestionsRoute,
    getQuestionsRouteHandler,
} from './controllers/get-questions.controller';
import {
    updateQuestionRoute,
    updateQuestionRouteHandler,
} from './controllers/update-question.controller';

const questionRoutes = new OpenAPIHono<HonoEnv>();

questionRoutes.use('*', authMiddleware);

questionRoutes
    .openapi(getQuestionsRoute, getQuestionsRouteHandler)
    .openapi(getQuestionTypeCountsRoute, getQuestionTypeCountsRouteHandler)
    .openapi(getQuestionRoute, getQuestionRouteHandler)
    .openapi(createQuestionRoute, createQuestionRouteHandler)
    .openapi(updateQuestionRoute, updateQuestionRouteHandler)
    .openapi(deleteQuestionRoute, deleteQuestionRouteHandler);

export default questionRoutes;
