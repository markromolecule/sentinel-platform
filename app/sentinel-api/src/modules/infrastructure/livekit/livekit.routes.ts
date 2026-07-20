import { OpenAPIHono } from '@hono/zod-openapi';
import type { HonoEnv } from '../../../types/hono';
import { liveKitWebhookRouteHandler } from './controllers/livekit-webhook.controller';

const liveKitRoutes = new OpenAPIHono<HonoEnv>();

liveKitRoutes.post('/webhooks', liveKitWebhookRouteHandler as any);

export default liveKitRoutes;
