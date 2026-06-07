import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import { requirePermission } from '../../../lib/permissions';
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
import {
    deleteSemestersRoute,
    deleteSemestersRouteHandler,
} from './controllers/delete-semesters.controller';

const semesters = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all semester routes
semesters.use('*', authMiddleware);

// Restrict access based on role permissions
semesters.use('/', (c, next) => {
    const permission = c.req.method === 'GET' ? 'semesters:view' : 'semesters:manage';
    return requirePermission(permission)(c, next);
});

semesters.use('/:id', (c, next) => {
    const permission = c.req.method === 'GET' ? 'semesters:view' : 'semesters:manage';
    return requirePermission(permission)(c, next);
});

semesters.use('/bulk-delete', requirePermission('semesters:manage'));

semesters.openapi(getSemestersRoute, getSemestersRouteHandler);
semesters.openapi(createSemesterRoute, createSemesterRouteHandler);
semesters.openapi(updateSemesterRoute, updateSemesterRouteHandler);
semesters.openapi(deleteSemesterRoute, deleteSemesterRouteHandler);
semesters.openapi(deleteSemestersRoute, deleteSemestersRouteHandler);

export default semesters;
