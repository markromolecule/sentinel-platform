import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware, type AppBindings } from '../../../middleware/auth';
import { roleAuthMiddleware } from '../../../middleware/role-auth';

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
import {
    deleteInstitutionsRoute,
    deleteInstitutionsRouteHandler,
} from './controllers/delete-institutions.controller';
import {
    getInstitutionBranchesRoute,
    getInstitutionBranchesRouteHandler,
} from './controllers/get-institution-branches.controller';
import {
    linkInstitutionBranchRoute,
    linkInstitutionBranchRouteHandler,
} from './controllers/link-institution-branch.controller';
import {
    unlinkInstitutionBranchRoute,
    unlinkInstitutionBranchRouteHandler,
} from './controllers/unlink-institution-branch.controller';
import {
    getEffectiveInstitutionNamingConventionRoute,
    getEffectiveInstitutionNamingConventionRouteHandler,
} from './controllers/get-effective-institution-naming-convention.controller';
import {
    saveInstitutionNamingConventionRoute,
    saveInstitutionNamingConventionRouteHandler,
} from './controllers/save-institution-naming-convention.controller';

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

institutionRoutes.use('/bulk-delete', (c, next) => {
    return roleAuthMiddleware(['support'])(c, next);
});

institutionRoutes.use('/:id/branches', (c, next) => {
    const allowedRoles = c.req.method === 'GET' ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

institutionRoutes.use('/:id/branches/:branchId', (c, next) => {
    return roleAuthMiddleware(['support'])(c, next);
});

institutionRoutes.use('/:id/naming-conventions', (c, next) => {
    const allowedRoles = c.req.method === 'GET' ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

institutionRoutes.use('/:id/naming-conventions/effective', (c, next) => {
    return roleAuthMiddleware(['support', 'superadmin', 'admin'])(c, next);
});

// Traffic Director
institutionRoutes
    .openapi(createInstitutionRoute, createInstitutionRouteHandler)
    .openapi(getInstitutionsRoute, getInstitutionsRouteHandler)
    .openapi(getInstitutionBranchesRoute, getInstitutionBranchesRouteHandler)
    .openapi(linkInstitutionBranchRoute, linkInstitutionBranchRouteHandler)
    .openapi(unlinkInstitutionBranchRoute, unlinkInstitutionBranchRouteHandler)
    .openapi(
        getEffectiveInstitutionNamingConventionRoute,
        getEffectiveInstitutionNamingConventionRouteHandler,
    )
    .openapi(saveInstitutionNamingConventionRoute, saveInstitutionNamingConventionRouteHandler)
    .openapi(updateInstitutionRoute, updateInstitutionRouteHandler)
    .openapi(deleteInstitutionRoute, deleteInstitutionRouteHandler)
    .openapi(deleteInstitutionsRoute, deleteInstitutionsRouteHandler);

export default institutionRoutes;
