import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '@/middleware/auth';
import { aiRateLimitMiddleware } from '@/middleware/ai-rate-limit';
import { type HonoEnv } from '@/types/hono';
import { generatePreviewRoute, generatePreviewRouteHandler } from './gemini.controller';

const aiRoutes = new OpenAPIHono<HonoEnv>();

aiRoutes.use('*', authMiddleware);
aiRoutes.use('/generate-preview', aiRateLimitMiddleware);

aiRoutes.openapi(generatePreviewRoute, generatePreviewRouteHandler);

export default aiRoutes;
