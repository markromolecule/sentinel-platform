import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    createClassroomRoute,
    createClassroomRouteHandler,
} from './controllers/create-classroom.controller';
import {
    deleteClassroomRoute,
    deleteClassroomRouteHandler,
} from './controllers/delete-classroom.controller';
import {
    deleteClassroomStudentRoute,
    deleteClassroomStudentRouteHandler,
} from './controllers/delete-classroom-student.controller';
import {
    getClassroomRoute,
    getClassroomRouteHandler,
} from './controllers/get-classroom.controller';
import {
    getClassroomsRoute,
    getClassroomsRouteHandler,
} from './controllers/get-classrooms.controller';
import {
    updateClassroomRoute,
    updateClassroomRouteHandler,
} from './controllers/update-classroom.controller';

const classroomRoutes = new OpenAPIHono<HonoEnv>();

classroomRoutes.use('*', authMiddleware);

classroomRoutes
    .openapi(getClassroomsRoute, getClassroomsRouteHandler)
    .openapi(getClassroomRoute, getClassroomRouteHandler)
    .openapi(createClassroomRoute, createClassroomRouteHandler)
    .openapi(updateClassroomRoute, updateClassroomRouteHandler)
    .openapi(deleteClassroomRoute, deleteClassroomRouteHandler)
    .openapi(deleteClassroomStudentRoute, deleteClassroomStudentRouteHandler);

export default classroomRoutes;
