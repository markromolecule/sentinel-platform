import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    assignClassroomInstructorRoute,
    assignClassroomInstructorRouteHandler,
} from './controllers/assign-classroom-instructor.controller';
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
    getClassroomInstructorsRoute,
    getClassroomInstructorsRouteHandler,
} from './controllers/get-classroom-instructors.controller';
import {
    getClassroomsRoute,
    getClassroomsRouteHandler,
} from './controllers/get-classrooms.controller';
import {
    removeClassroomInstructorRoute,
    removeClassroomInstructorRouteHandler,
} from './controllers/remove-classroom-instructor.controller';
import {
    updateClassroomRoute,
    updateClassroomRouteHandler,
} from './controllers/update-classroom.controller';

const classroomRoutes = new OpenAPIHono<HonoEnv>();

classroomRoutes.use('*', authMiddleware);

classroomRoutes
    .openapi(getClassroomsRoute, getClassroomsRouteHandler)
    .openapi(getClassroomRoute, getClassroomRouteHandler)
    .openapi(getClassroomInstructorsRoute, getClassroomInstructorsRouteHandler)
    .openapi(createClassroomRoute, createClassroomRouteHandler)
    .openapi(assignClassroomInstructorRoute, assignClassroomInstructorRouteHandler)
    .openapi(updateClassroomRoute, updateClassroomRouteHandler)
    .openapi(deleteClassroomRoute, deleteClassroomRouteHandler)
    .openapi(removeClassroomInstructorRoute, removeClassroomInstructorRouteHandler)
    .openapi(deleteClassroomStudentRoute, deleteClassroomStudentRouteHandler);

export default classroomRoutes;
