import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    createStudentExamAccessOverrideRoute,
    createStudentExamAccessOverrideRouteHandler,
} from './controllers/create-student-exam-access-override.controller';
import {
    overrideReconnectLimitRoute,
    overrideReconnectLimitRouteHandler,
} from './controllers/override-reconnect-limit.controller';

const studentOverridesRoutes = new OpenAPIHono<HonoEnv>();

studentOverridesRoutes.use('*', authMiddleware);

studentOverridesRoutes.openapi(
    createStudentExamAccessOverrideRoute,
    createStudentExamAccessOverrideRouteHandler,
);
studentOverridesRoutes.openapi(overrideReconnectLimitRoute, overrideReconnectLimitRouteHandler);

export default studentOverridesRoutes;
