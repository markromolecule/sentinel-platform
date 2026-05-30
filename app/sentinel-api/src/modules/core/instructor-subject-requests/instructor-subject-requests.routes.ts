import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    submitSubjectRequestRoute,
    submitSubjectRequestRouteHandler,
} from './controllers/submit-request.controller';
import {
    reviewSubjectRequestRoute,
    reviewSubjectRequestRouteHandler,
} from './controllers/review-request.controller';
import {
    cancelSubjectRequestRoute,
    cancelSubjectRequestRouteHandler,
} from './controllers/cancel-request.controller';
import {
    listSubjectRequestsRoute,
    listSubjectRequestsRouteHandler,
} from './controllers/list-requests.controller';
import {
    assignQualificationRoute,
    assignQualificationRouteHandler,
} from './controllers/assign-qualification.controller';
import {
    revokeQualificationRoute,
    revokeQualificationRouteHandler,
} from './controllers/revoke-qualification.controller';
import {
    listQualifiedInstructorsRoute,
    listQualifiedInstructorsRouteHandler,
} from './controllers/list-qualified-instructors.controller';

const instructorSubjectRequestRoutes = new OpenAPIHono<HonoEnv>();

instructorSubjectRequestRoutes.use('*', authMiddleware);

instructorSubjectRequestRoutes
    .openapi(listSubjectRequestsRoute, listSubjectRequestsRouteHandler)
    .openapi(submitSubjectRequestRoute, submitSubjectRequestRouteHandler)
    .openapi(reviewSubjectRequestRoute, reviewSubjectRequestRouteHandler)
    .openapi(cancelSubjectRequestRoute, cancelSubjectRequestRouteHandler)
    .openapi(assignQualificationRoute, assignQualificationRouteHandler)
    .openapi(revokeQualificationRoute, revokeQualificationRouteHandler)
    .openapi(listQualifiedInstructorsRoute, listQualifiedInstructorsRouteHandler);

export default instructorSubjectRequestRoutes;
