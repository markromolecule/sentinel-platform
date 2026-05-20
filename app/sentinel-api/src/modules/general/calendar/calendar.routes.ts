import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    getCalendarEventsRoute,
    getCalendarEventsRouteHandler,
} from './controllers/get-calendar-events.controller';
import {
    getCalendarEventRoute,
    getCalendarEventRouteHandler,
} from './controllers/get-calendar-event.controller';
import {
    createCalendarEventRoute,
    createCalendarEventRouteHandler,
} from './controllers/create-calendar-event.controller';
import {
    updateCalendarEventRoute,
    updateCalendarEventRouteHandler,
} from './controllers/update-calendar-event.controller';
import {
    deleteCalendarEventRoute,
    deleteCalendarEventRouteHandler,
} from './controllers/delete-calendar-event.controller';

const calendarRoutes = new OpenAPIHono<HonoEnv>();

calendarRoutes.use('*', authMiddleware);

calendarRoutes
    .openapi(getCalendarEventsRoute, getCalendarEventsRouteHandler)
    .openapi(getCalendarEventRoute, getCalendarEventRouteHandler)
    .openapi(createCalendarEventRoute, createCalendarEventRouteHandler)
    .openapi(updateCalendarEventRoute, updateCalendarEventRouteHandler)
    .openapi(deleteCalendarEventRoute, deleteCalendarEventRouteHandler);

export default calendarRoutes;
