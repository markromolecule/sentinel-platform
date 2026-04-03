import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../middleware/auth';
import { type HonoEnv } from '../../types/hono';
import {
    getExamConfigurationRoute,
    getExamConfigurationRouteHandler,
} from './controllers/get-exam-configuration.controller';
import {
    updateExamConfigurationRoute,
    updateExamConfigurationRouteHandler,
} from './controllers/update-exam-configuration.controller';

const configurationRoutes = new OpenAPIHono<HonoEnv>();

configurationRoutes.use('*', authMiddleware);

configurationRoutes
    .openapi(getExamConfigurationRoute, getExamConfigurationRouteHandler)
    .openapi(updateExamConfigurationRoute, updateExamConfigurationRouteHandler);

export default configurationRoutes;
