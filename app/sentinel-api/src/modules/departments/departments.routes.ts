import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../types/hono';
import { authMiddleware } from '../../middleware/auth';

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

const departmentsRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all department routes
departmentsRoutes.use('*', authMiddleware);

// Traffic Director
departmentsRoutes
    .openapi(createDepartmentRoute, createDepartmentRouteHandler)
    .openapi(getDepartmentsRoute, getDepartmentsRouteHandler)
    .openapi(updateDepartmentRoute, updateDepartmentRouteHandler)
    .openapi(deleteDepartmentRoute, deleteDepartmentRouteHandler);

export default departmentsRoutes;
