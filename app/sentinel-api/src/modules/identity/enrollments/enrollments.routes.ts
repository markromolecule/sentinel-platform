import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';

import {
    enrollSubjectRoute,
    enrollSubjectRouteHandler,
} from './controllers/enroll-subject.controller';
import {
    getEnrolledSubjectsRoute,
    getEnrolledSubjectsRouteHandler,
} from './controllers/get-enrolled-subjects.controller';
import {
    getEnrollmentRequestsRoute,
    getEnrollmentRequestsRouteHandler,
} from './controllers/get-enrollment-requests.controller';
import {
    updateEnrollmentRequestRoute,
    updateEnrollmentRequestRouteHandler,
} from './controllers/update-enrollment-request.controller';
import {
    approveEnrollmentRequestRoute,
    approveEnrollmentRequestRouteHandler,
} from './controllers/approve-enrollment-request.controller';
import {
    rejectEnrollmentRequestRoute,
    rejectEnrollmentRequestRouteHandler,
} from './controllers/reject-enrollment-request.controller';
import {
    unapproveEnrollmentRequestRoute,
    unapproveEnrollmentRequestRouteHandler,
} from './controllers/unapprove-enrollment-request.controller';
import {
    deleteEnrollmentRequestsRoute,
    deleteEnrollmentRequestsRouteHandler,
} from './controllers/delete-enrollment-requests.controller';
import {
    unenrollInstructorSubjectRoute,
    unenrollInstructorSubjectRouteHandler,
} from './controllers/unenroll-instructor-subject.controller';
import {
    enrollStudentsRoute,
    enrollStudentsRouteHandler,
} from './controllers/enroll-students.controller';
import {
    previewStudentEnrollmentRoute,
    previewStudentEnrollmentRouteHandler,
} from './controllers/preview-student-enrollment.controller';
import {
    getStudentClassroomsRoute,
    getStudentClassroomsRouteHandler,
} from './controllers/get-student-classrooms.controller';
import {
    unenrollStudentRoute,
    unenrollStudentRouteHandler,
} from './controllers/unenroll-student.controller';
import {
    bulkDeleteEnrollmentRoute,
    bulkDeleteEnrollmentRouteHandler,
} from './controllers/bulk-unenroll-students.controller';

const enrollmentsRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all enrollment routes
enrollmentsRoutes.use('*', authMiddleware);

// Enrollment Routes
enrollmentsRoutes
    .openapi(getEnrolledSubjectsRoute, getEnrolledSubjectsRouteHandler)
    .openapi(getEnrollmentRequestsRoute, getEnrollmentRequestsRouteHandler)
    .openapi(updateEnrollmentRequestRoute, updateEnrollmentRequestRouteHandler)
    .openapi(approveEnrollmentRequestRoute, approveEnrollmentRequestRouteHandler)
    .openapi(rejectEnrollmentRequestRoute, rejectEnrollmentRequestRouteHandler)
    .openapi(unapproveEnrollmentRequestRoute, unapproveEnrollmentRequestRouteHandler)
    .openapi(deleteEnrollmentRequestsRoute, deleteEnrollmentRequestsRouteHandler)
    .openapi(enrollSubjectRoute, enrollSubjectRouteHandler)
    .openapi(previewStudentEnrollmentRoute, previewStudentEnrollmentRouteHandler)
    .openapi(enrollStudentsRoute, enrollStudentsRouteHandler)
    .openapi(getStudentClassroomsRoute, getStudentClassroomsRouteHandler)
    .openapi(unenrollStudentRoute, unenrollStudentRouteHandler)
    .openapi(bulkDeleteEnrollmentRoute, bulkDeleteEnrollmentRouteHandler)
    .openapi(unenrollInstructorSubjectRoute, unenrollInstructorSubjectRouteHandler);

export default enrollmentsRoutes;
