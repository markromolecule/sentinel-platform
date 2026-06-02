import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';
import {
    getAnnouncementsRoute,
    getAnnouncementsRouteHandler,
} from './controllers/get-announcements.controller';
import {
    getAnnouncementBySlugRoute,
    getAnnouncementBySlugRouteHandler,
} from './controllers/get-announcement-by-slug.controller';
import {
    getAnnouncementByIdRoute,
    getAnnouncementByIdRouteHandler,
} from './controllers/get-announcement-by-id.controller';
import {
    createAnnouncementRoute,
    createAnnouncementRouteHandler,
} from './controllers/create-announcement.controller';
import {
    updateAnnouncementRoute,
    updateAnnouncementRouteHandler,
} from './controllers/update-announcement.controller';
import {
    deleteAnnouncementRoute,
    deleteAnnouncementRouteHandler,
} from './controllers/delete-announcement.controller';

const announcementRoutes = new OpenAPIHono<HonoEnv>();

announcementRoutes.use('*', authMiddleware);

announcementRoutes
    .openapi(getAnnouncementsRoute, getAnnouncementsRouteHandler)
    .openapi(getAnnouncementBySlugRoute, getAnnouncementBySlugRouteHandler)
    .openapi(getAnnouncementByIdRoute, getAnnouncementByIdRouteHandler)
    .openapi(createAnnouncementRoute, createAnnouncementRouteHandler)
    .openapi(updateAnnouncementRoute, updateAnnouncementRouteHandler)
    .openapi(deleteAnnouncementRoute, deleteAnnouncementRouteHandler);

export default announcementRoutes;
