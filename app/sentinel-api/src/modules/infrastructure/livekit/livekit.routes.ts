import { OpenAPIHono } from '@hono/zod-openapi';
import type { HonoEnv } from '../../../types/hono';
import {
    liveKitWebhookRoute,
    liveKitWebhookRouteHandler,
} from './controllers/livekit-webhook.controller';

const liveKitRoutes = new OpenAPIHono<HonoEnv>();

liveKitRoutes.openapi(liveKitWebhookRoute, liveKitWebhookRouteHandler);

export default liveKitRoutes;
