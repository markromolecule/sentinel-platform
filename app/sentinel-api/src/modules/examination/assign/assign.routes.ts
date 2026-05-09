import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    acceptExamAssignmentRoute,
    acceptExamAssignmentRouteHandler,
} from './controllers/accept-exam-assignment.controller';
import {
    createExamAssignmentRoute,
    createExamAssignmentRouteHandler,
} from './controllers/create-exam-assignment.controller';
import {
    getExamAssignmentsRoute,
    getExamAssignmentsRouteHandler,
} from './controllers/get-exam-assignments.controller';
import {
    rejectExamAssignmentRoute,
    rejectExamAssignmentRouteHandler,
} from './controllers/reject-exam-assignment.controller';

const assignRoutes = new OpenAPIHono<HonoEnv>();

assignRoutes.use('*', authMiddleware);

assignRoutes
    .openapi(getExamAssignmentsRoute, getExamAssignmentsRouteHandler)
    .openapi(createExamAssignmentRoute, createExamAssignmentRouteHandler)
    .openapi(acceptExamAssignmentRoute, acceptExamAssignmentRouteHandler)
    .openapi(rejectExamAssignmentRoute, rejectExamAssignmentRouteHandler);

export default assignRoutes;
