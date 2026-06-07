import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware, type AppBindings } from '../../../middleware/auth';
import { requirePermission } from '../../../lib/permissions';
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

// Restrict access based on role permissions
institutionRoutes.use('/', (c, next) => {
    const permission = c.req.method === 'GET' ? 'institutions:view' : 'institutions:manage';
    return requirePermission(permission)(c, next);
});

institutionRoutes.use('/:id', (c, next) => {
    const permission = c.req.method === 'GET' ? 'institutions:view' : 'institutions:manage';
    return requirePermission(permission)(c, next);
});

institutionRoutes.use('/bulk-delete', requirePermission('institutions:manage'));

institutionRoutes.use('/:id/branches', (c, next) => {
    const permission = c.req.method === 'GET' ? 'institutions:view' : 'institutions:manage';
    return requirePermission(permission)(c, next);
});

institutionRoutes.use('/:id/branches/:branchId', (c, next) => {
    const permission = c.req.method === 'GET' ? 'institutions:view' : 'institutions:manage';
    return requirePermission(permission)(c, next);
});

institutionRoutes.use('/:id/naming-conventions', (c, next) => {
    const permission = c.req.method === 'GET' ? 'institutions:view' : 'institutions:manage';
    return requirePermission(permission)(c, next);
});

institutionRoutes.use('/:id/naming-conventions/effective', (c, next) => {
    const permission = c.req.method === 'GET' ? 'institutions:view' : 'institutions:manage';
    return requirePermission(permission)(c, next);
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
