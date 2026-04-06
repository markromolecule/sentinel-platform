import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '@/middleware/auth';
import { type HonoEnv } from '@/types/hono';
import {
    getQuestionTypeRoute,
    getQuestionTypeRouteHandler,
} from './controllers/get-question-type.controller';
import {
    getQuestionTypesRoute,
    getQuestionTypesRouteHandler,
} from './controllers/get-question-types.controller';
import {
    validateQuestionTypeContentRoute,
    validateQuestionTypeContentRouteHandler,
} from './controllers/validate-question-type-content.controller';

const questionTypeRoutes = new OpenAPIHono<HonoEnv>();

questionTypeRoutes.use('*', authMiddleware);

questionTypeRoutes
    .openapi(getQuestionTypesRoute, getQuestionTypesRouteHandler)
    .openapi(getQuestionTypeRoute, getQuestionTypeRouteHandler)
    .openapi(validateQuestionTypeContentRoute, validateQuestionTypeContentRouteHandler);

export default questionTypeRoutes;
