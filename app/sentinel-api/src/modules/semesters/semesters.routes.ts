import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../types/hono';
import { authMiddleware } from '../../middleware/auth';
import { getSemestersRoute, getSemestersRouteHandler } from './controllers/get-semesters.controller';
import { createSemesterRoute, createSemesterRouteHandler } from './controllers/create-semester.controller';
import { updateSemesterRoute, updateSemesterRouteHandler } from './controllers/update-semester.controller';
import { deleteSemesterRoute, deleteSemesterRouteHandler } from './controllers/delete-semester.controller';

const semesters = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all semester routes
semesters.use('*', authMiddleware);

semesters.openapi(getSemestersRoute, getSemestersRouteHandler);
semesters.openapi(createSemesterRoute, createSemesterRouteHandler);
semesters.openapi(updateSemesterRoute, updateSemesterRouteHandler);
semesters.openapi(deleteSemesterRoute, deleteSemesterRouteHandler);

export default semesters;
