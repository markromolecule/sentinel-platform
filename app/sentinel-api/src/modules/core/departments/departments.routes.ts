import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '@/types/hono';
import { authMiddleware, type AppBindings } from '@/middleware/auth';
import { roleAuthMiddleware } from '@/middleware/role-auth';

import {
    createDepartmentRoute,
    createDepartmentRouteHandler,
} from './controllers/create-department.controller';
import {
    getDepartmentsRoute,
    getDepartmentsRouteHandler,
} from './controllers/get-departments.controller';
import {
    updateDepartmentRoute,
    updateDepartmentRouteHandler,
} from './controllers/update-department.controller';
import {
    deleteDepartmentRoute,
    deleteDepartmentRouteHandler,
} from './controllers/delete-department.controller';

const departmentsRoutes = new OpenAPIHono<AppBindings>();

// Apply auth middleware to all department routes
departmentsRoutes.use('*', authMiddleware);

// Relax GET permissions to allow superadmin and admin to see lists
departmentsRoutes.use('/', (c, next) => {
    const allowedRoles = c.req.method === 'GET' ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

departmentsRoutes.use('/:id', (c, next) => {
    const allowedRoles = c.req.method === 'GET' ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

// Traffic Director
departmentsRoutes
    .openapi(createDepartmentRoute, createDepartmentRouteHandler)
    .openapi(getDepartmentsRoute, getDepartmentsRouteHandler)
    .openapi(updateDepartmentRoute, updateDepartmentRouteHandler)
    .openapi(deleteDepartmentRoute, deleteDepartmentRouteHandler);

export default departmentsRoutes;
