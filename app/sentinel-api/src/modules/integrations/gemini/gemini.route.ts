import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { aiRateLimitMiddleware } from '../../../middleware/ai-rate-limit';
import { type HonoEnv } from '../../../types/hono';
import {
    generatePreviewRoute,
    generatePreviewRouteHandler,
    legacyGenerateReviewRoute,
} from './gemini.controller';

const aiRoutes = new OpenAPIHono<HonoEnv>();

aiRoutes.use('*', authMiddleware);
aiRoutes.use('/generate-preview', aiRateLimitMiddleware);
aiRoutes.use('/generate-review', aiRateLimitMiddleware);

aiRoutes.openapi(generatePreviewRoute, generatePreviewRouteHandler);
aiRoutes.openapi(legacyGenerateReviewRoute, generatePreviewRouteHandler);

export default aiRoutes;
