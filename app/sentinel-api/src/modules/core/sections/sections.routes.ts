import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';

import {
    createSectionRoute,
    createSectionRouteHandler,
} from './controllers/create-section.controller';
import { getSectionsRoute, getSectionsRouteHandler } from './controllers/get-sections.controller';
import {
    updateSectionRoute,
    updateSectionRouteHandler,
} from './controllers/update-section.controller';
import {
    deleteSectionRoute,
    deleteSectionRouteHandler,
} from './controllers/delete-section.controller';
import {
    deleteSectionsRoute,
    deleteSectionsRouteHandler,
} from './controllers/delete-sections.controller';

const sectionsRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all section routes
sectionsRoutes.use('*', authMiddleware);

// Traffic Director
sectionsRoutes
    .openapi(createSectionRoute, createSectionRouteHandler)
    .openapi(getSectionsRoute, getSectionsRouteHandler)
    .openapi(updateSectionRoute, updateSectionRouteHandler)
    .openapi(deleteSectionRoute, deleteSectionRouteHandler)
    .openapi(deleteSectionsRoute, deleteSectionsRouteHandler);

export default sectionsRoutes;
