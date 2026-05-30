import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    assignClassroomInstructorRoute,
    assignClassroomInstructorRouteHandler,
} from './controllers/assign-classroom-instructor.controller';
import {
    getUnassignedClassroomsRoute,
    getUnassignedClassroomsRouteHandler,
} from './controllers/get-unassigned-classrooms.controller';
import {
    getInstructorLoadSummaryRoute,
    getInstructorLoadSummaryRouteHandler,
} from './controllers/get-instructor-load-summary.controller';
import {
    getSmartSuggestionsRoute,
    getSmartSuggestionsRouteHandler,
} from './controllers/get-smart-suggestions.controller';
import {
    bulkAssignClassroomInstructorsRoute,
    bulkAssignClassroomInstructorsRouteHandler,
} from './controllers/bulk-assign-classroom-instructors.controller';
import {
    acknowledgeClassroomAssignmentRoute,
    acknowledgeClassroomAssignmentRouteHandler,
} from './controllers/acknowledge-classroom-assignment.controller';
import {
    flagClassroomAssignmentRoute,
    flagClassroomAssignmentRouteHandler,
} from './controllers/flag-classroom-assignment.controller';
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
    .openapi(deleteClassroomStudentRoute, deleteClassroomStudentRouteHandler)
    .openapi(acknowledgeClassroomAssignmentRoute, acknowledgeClassroomAssignmentRouteHandler)
    .openapi(flagClassroomAssignmentRoute, flagClassroomAssignmentRouteHandler)
    .openapi(getUnassignedClassroomsRoute, getUnassignedClassroomsRouteHandler)
    .openapi(getInstructorLoadSummaryRoute, getInstructorLoadSummaryRouteHandler)
    .openapi(getSmartSuggestionsRoute, getSmartSuggestionsRouteHandler)
    .openapi(bulkAssignClassroomInstructorsRoute, bulkAssignClassroomInstructorsRouteHandler);

export default classroomRoutes;
