import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getExamSectionAssignmentsRoute,
    getExamSectionAssignmentsRouteHandler,
} from './controllers/get-exam-section-assignments.controller';
import {
    createExamSectionAssignmentRoute,
    createExamSectionAssignmentRouteHandler,
} from './controllers/create-exam-section-assignment.controller';
import {
    createExamSectionAssignmentsBatchRoute,
    createExamSectionAssignmentsBatchRouteHandler,
} from './controllers/create-exam-section-assignments-batch.controller';
import {
    updateExamSectionAssignmentRoute,
    updateExamSectionAssignmentRouteHandler,
} from './controllers/update-exam-section-assignment.controller';
import {
    deleteExamSectionAssignmentRoute,
    deleteExamSectionAssignmentRouteHandler,
} from './controllers/delete-exam-section-assignment.controller';

const sectionAssignmentsRoutes = new OpenAPIHono<HonoEnv>();

sectionAssignmentsRoutes.use('*', authMiddleware);

sectionAssignmentsRoutes
    .openapi(getExamSectionAssignmentsRoute, getExamSectionAssignmentsRouteHandler)
    .openapi(createExamSectionAssignmentRoute, createExamSectionAssignmentRouteHandler)
    .openapi(createExamSectionAssignmentsBatchRoute, createExamSectionAssignmentsBatchRouteHandler)
    .openapi(updateExamSectionAssignmentRoute, updateExamSectionAssignmentRouteHandler)
    .openapi(deleteExamSectionAssignmentRoute, deleteExamSectionAssignmentRouteHandler);

export default sectionAssignmentsRoutes;
