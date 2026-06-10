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
import {
    markAllNotificationsReadRoute,
    markAllNotificationsReadRouteHandler,
} from './controllers/mark-all-notifications-read.controller';
import {
    deleteNotificationsRoute,
    deleteNotificationsRouteHandler,
} from './controllers/delete-notifications.controller';

const notificationRoutes = new OpenAPIHono<HonoEnv>();

notificationRoutes.use('*', authMiddleware);

notificationRoutes
    .openapi(getNotificationsRoute, getNotificationsRouteHandler)
    .openapi(markNotificationReadRoute, markNotificationReadRouteHandler)
    .openapi(markAllNotificationsReadRoute, markAllNotificationsReadRouteHandler)
    .openapi(deleteNotificationsRoute, deleteNotificationsRouteHandler);

export default notificationRoutes;
