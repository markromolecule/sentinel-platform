import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    checkInLobbyRoute,
    checkInLobbyRouteHandler,
} from './controllers/check-in-lobby.controller';
import {
    getAdmissionStatusRoute,
    getAdmissionStatusRouteHandler,
} from './controllers/get-admission-status.controller';
import {
    getWaitingListRoute,
    getWaitingListRouteHandler,
} from './controllers/get-waiting-list.controller';
import {
    updateAdmissionsRoute,
    updateAdmissionsRouteHandler,
} from './controllers/update-admissions.controller';

const lobbyRoutes = new OpenAPIHono<HonoEnv>();

lobbyRoutes.use('*', authMiddleware);

lobbyRoutes.openapi(checkInLobbyRoute, checkInLobbyRouteHandler);
lobbyRoutes.openapi(getAdmissionStatusRoute, getAdmissionStatusRouteHandler);
lobbyRoutes.openapi(getWaitingListRoute, getWaitingListRouteHandler);
lobbyRoutes.openapi(updateAdmissionsRoute, updateAdmissionsRouteHandler);

export default lobbyRoutes;
