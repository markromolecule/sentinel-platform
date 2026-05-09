import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    getNotificationsRoute,
    getNotificationsRouteHandler,
} from './controllers/get-notifications.controller';
import {
    markNotificationReadRoute,
    markNotificationReadRouteHandler,
} from './controllers/mark-notification-read.controller';

const notificationRoutes = new OpenAPIHono<HonoEnv>();

notificationRoutes.use('*', authMiddleware);

notificationRoutes
    .openapi(getNotificationsRoute, getNotificationsRouteHandler)
    .openapi(markNotificationReadRoute, markNotificationReadRouteHandler);

export default notificationRoutes;
