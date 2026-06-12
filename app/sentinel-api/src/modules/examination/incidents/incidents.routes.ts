import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import {
    getExamIncidentsRoute,
    getExamIncidentsRouteHandler,
} from './controllers/get-exam-incidents.controller';
import {
    reviewExamIncidentsRoute,
    reviewExamIncidentsRouteHandler,
} from './controllers/review-exam-incidents.controller';

export function registerIncidentsRoutes(app: OpenAPIHono<HonoEnv>) {
    app.openapi(getExamIncidentsRoute, getExamIncidentsRouteHandler);
    app.openapi(reviewExamIncidentsRoute, reviewExamIncidentsRouteHandler);
}
