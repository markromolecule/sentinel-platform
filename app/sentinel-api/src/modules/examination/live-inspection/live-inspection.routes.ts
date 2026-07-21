import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import type { AppRouteHandler, HonoEnv } from '../../../types/hono';
import {
    acknowledgePublisherFailureSchema,
    acknowledgePublisherReadySchema,
    createPublisherConnectionSchema,
    createViewerConnectionSchema,
    getLiveInspectionStatusSchema,
    getStudentLiveInspectionDirectiveSchema,
    startLiveInspectionSchema,
    stopLiveInspectionSchema,
} from './live-inspection.dto';
import { startLiveInspection } from './services/start-live-inspection.service';
import { getLiveInspectionStatus } from './services/get-live-inspection-status.service';
import { createViewerConnection } from './services/create-viewer-connection.service';
import { stopLiveInspection } from './services/stop-live-inspection.service';
import { getStudentLiveInspectionDirective } from './services/get-student-live-inspection-directive.service';
import { createPublisherConnection } from './services/create-publisher-connection.service';
import { acknowledgePublisherReady } from './services/acknowledge-publisher-ready.service';
import { acknowledgePublisherFailure } from './services/acknowledge-publisher-failure.service';

export const startLiveInspectionRoute = createRoute({
    method: 'post',
    path: '/:examId/monitoring/live-inspections',
    tags: ['Live Inspection'],
    request: {
        params: startLiveInspectionSchema.params,
        body: { content: { 'application/json': { schema: startLiveInspectionSchema.body } } },
    },
    responses: {
        201: {
            description: 'Live inspection lease started',
            content: { 'application/json': { schema: startLiveInspectionSchema.response } },
        },
    },
});

export const getLiveInspectionStatusRoute = createRoute({
    method: 'get',
    path: '/:examId/monitoring/live-inspections/status',
    tags: ['Live Inspection'],
    request: {
        params: getLiveInspectionStatusSchema.params,
        query: getLiveInspectionStatusSchema.query,
    },
    responses: {
        200: {
            description: 'Live inspection status',
            content: { 'application/json': { schema: getLiveInspectionStatusSchema.response } },
        },
    },
});

export const createViewerConnectionRoute = createRoute({
    method: 'post',
    path: '/:examId/monitoring/live-inspections/:leaseId/viewer-connection',
    tags: ['Live Inspection'],
    request: { params: createViewerConnectionSchema.params },
    responses: {
        200: {
            description: 'Viewer LiveKit connection credentials',
            content: { 'application/json': { schema: createViewerConnectionSchema.response } },
        },
    },
});

export const stopLiveInspectionRoute = createRoute({
    method: 'post',
    path: '/:examId/monitoring/live-inspections/:leaseId/stop',
    tags: ['Live Inspection'],
    request: { params: stopLiveInspectionSchema.params },
    responses: {
        200: {
            description: 'Live inspection stopped',
            content: { 'application/json': { schema: stopLiveInspectionSchema.response } },
        },
    },
});

export const getStudentLiveInspectionDirectiveRoute = createRoute({
    method: 'post',
    path: '/live-inspections/directive',
    tags: ['Live Inspection'],
    request: {
        body: {
            content: {
                'application/json': { schema: getStudentLiveInspectionDirectiveSchema.body },
            },
        },
    },
    responses: {
        200: {
            description: 'Student live inspection directive',
            content: {
                'application/json': { schema: getStudentLiveInspectionDirectiveSchema.response },
            },
        },
    },
});

export const createPublisherConnectionRoute = createRoute({
    method: 'post',
    path: '/live-inspections/publisher-connection',
    tags: ['Live Inspection'],
    request: {
        body: { content: { 'application/json': { schema: createPublisherConnectionSchema.body } } },
    },
    responses: {
        200: {
            description: 'Publisher LiveKit connection credentials',
            content: { 'application/json': { schema: createPublisherConnectionSchema.response } },
        },
    },
});

export const acknowledgePublisherReadyRoute = createRoute({
    method: 'post',
    path: '/live-inspections/publisher-ready',
    tags: ['Live Inspection'],
    request: {
        body: { content: { 'application/json': { schema: acknowledgePublisherReadySchema.body } } },
    },
    responses: {
        200: {
            description: 'Publisher ready acknowledged',
            content: { 'application/json': { schema: acknowledgePublisherReadySchema.response } },
        },
    },
});

export const acknowledgePublisherFailureRoute = createRoute({
    method: 'post',
    path: '/live-inspections/publisher-failure',
    tags: ['Live Inspection'],
    request: {
        body: {
            content: { 'application/json': { schema: acknowledgePublisherFailureSchema.body } },
        },
    },
    responses: {
        200: {
            description: 'Publisher failure acknowledged',
            content: { 'application/json': { schema: acknowledgePublisherFailureSchema.response } },
        },
    },
});

export const startLiveInspectionRouteHandler: AppRouteHandler<
    typeof startLiveInspectionRoute
> = async (c) => {
    const { examId } = c.req.valid('param');
    const { attemptId } = c.req.valid('json');
    const status = await startLiveInspection({
        dbClient: c.get('dbClient'),
        examId,
        attemptId,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Live inspection started.', data: status }, 201);
};

export const getLiveInspectionStatusRouteHandler: AppRouteHandler<
    typeof getLiveInspectionStatusRoute
> = async (c) => {
    const { examId } = c.req.valid('param');
    const { attemptId, leaseId } = c.req.valid('query');
    const status = await getLiveInspectionStatus({
        dbClient: c.get('dbClient'),
        examId,
        attemptId,
        leaseId,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Live inspection status fetched.', data: status });
};

export const createViewerConnectionRouteHandler: AppRouteHandler<
    typeof createViewerConnectionRoute
> = async (c) => {
    const { examId, leaseId } = c.req.valid('param');
    const credentials = await createViewerConnection({
        dbClient: c.get('dbClient'),
        examId,
        leaseId,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Viewer connection created.', data: credentials });
};

export const stopLiveInspectionRouteHandler: AppRouteHandler<
    typeof stopLiveInspectionRoute
> = async (c) => {
    const { examId, leaseId } = c.req.valid('param');
    const status = await stopLiveInspection({
        dbClient: c.get('dbClient'),
        examId,
        leaseId,
        viewerUserId: c.get('user').id,
        role: c.get('role'),
        activeInstitutionId: c.get('institutionId'),
        activePermissionKeys: c.get('activePermissionKeys'),
    });

    return c.json({ message: 'Live inspection stopped.', data: status });
};

export const getStudentLiveInspectionDirectiveRouteHandler: AppRouteHandler<
    typeof getStudentLiveInspectionDirectiveRoute
> = async (c) => {
    const { sessionId } = c.req.valid('json');
    const directive = await getStudentLiveInspectionDirective({
        dbClient: c.get('dbClient'),
        sessionId,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Live inspection directive fetched.', data: directive });
};

export const createPublisherConnectionRouteHandler: AppRouteHandler<
    typeof createPublisherConnectionRoute
> = async (c) => {
    const body = c.req.valid('json');
    const credentials = await createPublisherConnection({
        dbClient: c.get('dbClient'),
        sessionId: body.sessionId,
        leaseId: body.leaseId,
        revision: body.revision,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Publisher connection created.', data: credentials });
};

export const acknowledgePublisherReadyRouteHandler: AppRouteHandler<
    typeof acknowledgePublisherReadyRoute
> = async (c) => {
    const body = c.req.valid('json');
    const ack = await acknowledgePublisherReady({
        dbClient: c.get('dbClient'),
        sessionId: body.sessionId,
        leaseId: body.leaseId,
        revision: body.revision,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Publisher ready acknowledged.', data: ack });
};

export const acknowledgePublisherFailureRouteHandler: AppRouteHandler<
    typeof acknowledgePublisherFailureRoute
> = async (c) => {
    const body = c.req.valid('json');
    const ack = await acknowledgePublisherFailure({
        dbClient: c.get('dbClient'),
        sessionId: body.sessionId,
        leaseId: body.leaseId,
        revision: body.revision,
        errorCode: body.errorCode,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Publisher failure acknowledged.', data: ack });
};

export function registerLiveInspectionStaffRoutes(app: OpenAPIHono<HonoEnv>) {
    app.openapi(startLiveInspectionRoute, startLiveInspectionRouteHandler)
        .openapi(getLiveInspectionStatusRoute, getLiveInspectionStatusRouteHandler)
        .openapi(createViewerConnectionRoute, createViewerConnectionRouteHandler)
        .openapi(stopLiveInspectionRoute, stopLiveInspectionRouteHandler);
}

const studentLiveInspectionRoutes = new OpenAPIHono<HonoEnv>();

studentLiveInspectionRoutes.use('*', authMiddleware);
studentLiveInspectionRoutes
    .openapi(getStudentLiveInspectionDirectiveRoute, getStudentLiveInspectionDirectiveRouteHandler)
    .openapi(createPublisherConnectionRoute, createPublisherConnectionRouteHandler)
    .openapi(acknowledgePublisherReadyRoute, acknowledgePublisherReadyRouteHandler)
    .openapi(acknowledgePublisherFailureRoute, acknowledgePublisherFailureRouteHandler);

export default studentLiveInspectionRoutes;
