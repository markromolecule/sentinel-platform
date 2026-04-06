import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import { roleAuthMiddleware } from '../../../middleware/role-auth';
import {
    getSemestersRoute,
    getSemestersRouteHandler,
} from './controllers/get-semesters.controller';
import {
    createSemesterRoute,
    createSemesterRouteHandler,
} from './controllers/create-semester.controller';
import {
    updateSemesterRoute,
    updateSemesterRouteHandler,
} from './controllers/update-semester.controller';
import {
    deleteSemesterRoute,
    deleteSemesterRouteHandler,
} from './controllers/delete-semester.controller';

const semesters = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all semester routes
semesters.use('*', authMiddleware);

// Relax GET permissions to allow superadmin and admin to see lists
semesters.use('/', (c, next) => {
    const isGet = c.req.method.toUpperCase() === 'GET';
    const allowedRoles = isGet ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

semesters.use('/:id', (c, next) => {
    const isGet = c.req.method.toUpperCase() === 'GET';
    const allowedRoles = isGet ? ['support', 'superadmin', 'admin'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

semesters.openapi(getSemestersRoute, getSemestersRouteHandler);
semesters.openapi(createSemesterRoute, createSemesterRouteHandler);
semesters.openapi(updateSemesterRoute, updateSemesterRouteHandler);
semesters.openapi(deleteSemesterRoute, deleteSemesterRouteHandler);

export default semesters;
