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

const enrollmentsRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all enrollment routes
enrollmentsRoutes.use('*', authMiddleware);

// Enrollment Routes
enrollmentsRoutes
    .openapi(getEnrolledSubjectsRoute, getEnrolledSubjectsRouteHandler)
    .openapi(getEnrollmentRequestsRoute, getEnrollmentRequestsRouteHandler)
    .openapi(approveEnrollmentRequestRoute, approveEnrollmentRequestRouteHandler)
    .openapi(rejectEnrollmentRequestRoute, rejectEnrollmentRequestRouteHandler)
    .openapi(unapproveEnrollmentRequestRoute, unapproveEnrollmentRequestRouteHandler)
    .openapi(deleteEnrollmentRequestsRoute, deleteEnrollmentRequestsRouteHandler)
    .openapi(enrollSubjectRoute, enrollSubjectRouteHandler)
    .openapi(unenrollInstructorSubjectRoute, unenrollInstructorSubjectRouteHandler);

export default enrollmentsRoutes;
