import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';

import {
    createSubjectRoute,
    createSubjectRouteHandler,
} from './controllers/create-subject.controller';
import { getSubjectsRoute, getSubjectsRouteHandler } from './controllers/get-subjects.controller';
import {
    updateSubjectRoute,
    updateSubjectRouteHandler,
} from './controllers/update-subject.controller';
import {
    deleteSubjectRoute,
    deleteSubjectRouteHandler,
} from './controllers/delete-subject.controller';
import {
    deleteSelectedSubjectsRoute,
    deleteSelectedSubjectsRouteHandler,
} from './controllers/delete-selected-subjects.controller';

const subjectsRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all subject routes
subjectsRoutes.use('*', authMiddleware);

// Subject Routes
subjectsRoutes
    .openapi(createSubjectRoute, createSubjectRouteHandler)
    .openapi(getSubjectsRoute, getSubjectsRouteHandler)
    .openapi(updateSubjectRoute, updateSubjectRouteHandler)
    .openapi(deleteSelectedSubjectsRoute, deleteSelectedSubjectsRouteHandler)
    .openapi(deleteSubjectRoute, deleteSubjectRouteHandler);

export default subjectsRoutes;
