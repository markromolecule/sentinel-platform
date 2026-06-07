import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware, type AppBindings } from '../../../middleware/auth';
import { requirePermission } from '../../../lib/permissions';
import {
    createDepartmentRoute,
    createDepartmentRouteHandler,
} from './controllers/create-department.controller';
import {
    getDepartmentsRoute,
    getDepartmentsRouteHandler,
} from './controllers/get-departments.controller';
import {
    createBulkDepartmentsRoute,
    createBulkDepartmentsRouteHandler,
} from './controllers/create-bulk-departments.controller';
import {
    updateDepartmentRoute,
    updateDepartmentRouteHandler,
} from './controllers/update-department.controller';
import {
    deleteDepartmentRoute,
    deleteDepartmentRouteHandler,
} from './controllers/delete-department.controller';
import {
    deleteDepartmentsRoute,
    deleteDepartmentsRouteHandler,
} from './controllers/delete-departments.controller';

const departmentsRoutes = new OpenAPIHono<AppBindings>();

// Apply auth middleware to all department routes
departmentsRoutes.use('*', authMiddleware);

// Restrict access based on role permissions
departmentsRoutes.use('/', (c, next) => {
    const permission = c.req.method === 'GET' ? 'departments:view' : 'departments:manage';
    return requirePermission(permission)(c, next);
});

departmentsRoutes.use('/:id', (c, next) => {
    const permission = c.req.method === 'GET' ? 'departments:view' : 'departments:manage';
    return requirePermission(permission)(c, next);
});

departmentsRoutes.use('/bulk-delete', requirePermission('departments:manage'));

// Traffic Director
departmentsRoutes
    .openapi(createDepartmentRoute, createDepartmentRouteHandler)
    .openapi(createBulkDepartmentsRoute, createBulkDepartmentsRouteHandler)
    .openapi(getDepartmentsRoute, getDepartmentsRouteHandler)
    .openapi(updateDepartmentRoute, updateDepartmentRouteHandler)
    .openapi(deleteDepartmentRoute, deleteDepartmentRouteHandler)
    .openapi(deleteDepartmentsRoute, deleteDepartmentsRouteHandler);

export default departmentsRoutes;
