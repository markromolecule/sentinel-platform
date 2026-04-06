import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '@/types/hono';
import { authMiddleware, type AppBindings } from '@/middleware/auth';
import { roleAuthMiddleware } from '@/middleware/role-auth';

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

const institutionRoutes = new OpenAPIHono<AppBindings>();

// Apply auth middleware to all institution routes
institutionRoutes.use('*', authMiddleware);

// Relax GET permissions to allow superadmin and admin to see lists
institutionRoutes.use('/', (c, next) => {
    const allowedRoles = c.req.method === 'GET' ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

institutionRoutes.use('/:id', (c, next) => {
    const allowedRoles = c.req.method === 'GET' ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

// Traffic Director
institutionRoutes
    .openapi(createInstitutionRoute, createInstitutionRouteHandler)
    .openapi(getInstitutionsRoute, getInstitutionsRouteHandler)
    .openapi(updateInstitutionRoute, updateInstitutionRouteHandler)
    .openapi(deleteInstitutionRoute, deleteInstitutionRouteHandler);

export default institutionRoutes;
