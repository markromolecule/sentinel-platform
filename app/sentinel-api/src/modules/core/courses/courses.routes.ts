import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '@/types/hono';

import { getCoursesRoute, getCoursesRouteHandler } from './controllers/get-courses.controller';
import {
    createCourseRoute,
    createCourseRouteHandler,
} from './controllers/create-course.controller';
import {
    updateCourseRoute,
    updateCourseRouteHandler,
} from './controllers/update-course.controller';
import {
    deleteCourseRoute,
    deleteCourseRouteHandler,
} from './controllers/delete-course.controller';
import { authMiddleware } from '@/middleware/auth';

const coursesRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all course routes
coursesRoutes.use('*', authMiddleware);

// Traffic Director
coursesRoutes
    .openapi(getCoursesRoute, getCoursesRouteHandler)
    .openapi(createCourseRoute, createCourseRouteHandler)
    .openapi(updateCourseRoute, updateCourseRouteHandler)
    .openapi(deleteCourseRoute, deleteCourseRouteHandler);

export default coursesRoutes;
