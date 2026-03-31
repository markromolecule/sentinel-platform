import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../types/hono';
import { authMiddleware } from '../../middleware/auth';
import {
    createSubjectOfferingRoute,
    createSubjectOfferingRouteHandler,
} from './controllers/create-subject-offering.controller';
import {
    getSubjectOfferingsRoute,
    getSubjectOfferingsRouteHandler,
} from './controllers/get-subject-offerings.controller';
import {
    updateSubjectOfferingRoute,
    updateSubjectOfferingRouteHandler,
} from './controllers/update-subject-offering.controller';

const subjectOfferingsRoutes = new OpenAPIHono<HonoEnv>();

subjectOfferingsRoutes.use('*', authMiddleware);

subjectOfferingsRoutes
    .openapi(createSubjectOfferingRoute, createSubjectOfferingRouteHandler)
    .openapi(getSubjectOfferingsRoute, getSubjectOfferingsRouteHandler)
    .openapi(updateSubjectOfferingRoute, updateSubjectOfferingRouteHandler);

export default subjectOfferingsRoutes;
