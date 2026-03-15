import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../types/hono';
import { authMiddleware } from '../../middleware/auth';

import {
    createInstitutionRoute,
    createInstitutionRouteHandler,
} from './controllers/create-institution.controller';
import {
    getInstitutionsRoute,
    getInstitutionsRouteHandler,
} from './controllers/get-institutions.controller';
import {
    updateInstitutionRoute,
    updateInstitutionRouteHandler,
} from './controllers/update-institution.controller';
import {
    deleteInstitutionRoute,
    deleteInstitutionRouteHandler,
} from './controllers/delete-institution.controller';

const institutionRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all institution routes
institutionRoutes.use('*', authMiddleware);

// Traffic Director
institutionRoutes
    .openapi(createInstitutionRoute, createInstitutionRouteHandler)
    .openapi(getInstitutionsRoute, getInstitutionsRouteHandler)
    .openapi(updateInstitutionRoute, updateInstitutionRouteHandler)
    .openapi(deleteInstitutionRoute, deleteInstitutionRouteHandler);

export default institutionRoutes;
