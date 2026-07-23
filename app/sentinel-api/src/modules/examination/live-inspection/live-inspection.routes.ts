import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';

import {
    startLiveInspectionRoute,
    startLiveInspectionRouteHandler,
} from './controllers/start-live-inspection.controller';
import {
    getLiveInspectionStatusRoute,
    getLiveInspectionStatusRouteHandler,
} from './controllers/get-live-inspection-status.controller';
import {
    createViewerConnectionRoute,
    createViewerConnectionRouteHandler,
} from './controllers/create-viewer-connection.controller';
import {
    stopLiveInspectionRoute,
    stopLiveInspectionRouteHandler,
} from './controllers/stop-live-inspection.controller';
import {
    getStudentLiveInspectionDirectiveRoute,
    getStudentLiveInspectionDirectiveRouteHandler,
} from './controllers/get-student-live-inspection-directive.controller';
import {
    createPublisherConnectionRoute,
    createPublisherConnectionRouteHandler,
} from './controllers/create-publisher-connection.controller';
import {
    acknowledgePublisherReadyRoute,
    acknowledgePublisherReadyRouteHandler,
} from './controllers/acknowledge-publisher-ready.controller';
import {
    acknowledgePublisherFailureRoute,
    acknowledgePublisherFailureRouteHandler,
} from './controllers/acknowledge-publisher-failure.controller';

export {
    startLiveInspectionRoute,
    getLiveInspectionStatusRoute,
    createViewerConnectionRoute,
    stopLiveInspectionRoute,
    getStudentLiveInspectionDirectiveRoute,
    createPublisherConnectionRoute,
    acknowledgePublisherReadyRoute,
    acknowledgePublisherFailureRoute,
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
