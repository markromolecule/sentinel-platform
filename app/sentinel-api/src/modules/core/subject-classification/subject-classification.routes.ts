import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    createSubjectClassificationRoute,
    createSubjectClassificationRouteHandler,
} from './controllers/create-subject-classification.controller';
import {
    deleteSubjectClassificationRoute,
    deleteSubjectClassificationRouteHandler,
} from './controllers/delete-subject-classification.controller';
import {
    getSubjectClassificationRoute,
    getSubjectClassificationRouteHandler,
} from './controllers/get-subject-classification.controller';
import {
    getSubjectClassificationsRoute,
    getSubjectClassificationsRouteHandler,
} from './controllers/get-subject-classifications.controller';
import {
    updateSubjectClassificationRoute,
    updateSubjectClassificationRouteHandler,
} from './controllers/update-subject-classification.controller';

const subjectClassificationRoutes = new OpenAPIHono<HonoEnv>();

subjectClassificationRoutes.use('*', authMiddleware);

subjectClassificationRoutes
    .openapi(getSubjectClassificationsRoute, getSubjectClassificationsRouteHandler)
    .openapi(getSubjectClassificationRoute, getSubjectClassificationRouteHandler)
    .openapi(createSubjectClassificationRoute, createSubjectClassificationRouteHandler)
    .openapi(updateSubjectClassificationRoute, updateSubjectClassificationRouteHandler)
    .openapi(deleteSubjectClassificationRoute, deleteSubjectClassificationRouteHandler);

export default subjectClassificationRoutes;
