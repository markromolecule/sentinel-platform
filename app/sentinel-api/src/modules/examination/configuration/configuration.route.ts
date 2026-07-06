import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getExaminationConfigurationDefaultsRoute,
    getExaminationConfigurationDefaultsRouteHandler,
} from './controllers/get-examination-configuration-defaults.controller';
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
    .openapi(
        getExaminationConfigurationDefaultsRoute,
        getExaminationConfigurationDefaultsRouteHandler,
    )
    .openapi(getExamConfigurationRoute, getExamConfigurationRouteHandler)
    .openapi(updateExamConfigurationRoute, updateExamConfigurationRouteHandler);

export default configurationRoutes;
