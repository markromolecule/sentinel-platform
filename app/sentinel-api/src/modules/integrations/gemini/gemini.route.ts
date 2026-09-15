import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { aiRateLimitMiddleware } from '../../../middleware/ai-rate-limit';
import { type HonoEnv } from '../../../types/hono';
import {
    createGeneratePreviewJobRoute,
    createGeneratePreviewJobRouteHandler,
    generatePreviewRoute,
    generatePreviewRouteHandler,
    getPreviewJobStatusRoute,
    getPreviewJobStatusRouteHandler,
    legacyGenerateReviewRoute,
} from './controller';

const aiRoutes = new OpenAPIHono<HonoEnv>();

aiRoutes.use('*', authMiddleware);
aiRoutes.use('/generate-preview', aiRateLimitMiddleware);
aiRoutes.use('/generate-review', aiRateLimitMiddleware);
aiRoutes.use('/generate-preview/jobs', aiRateLimitMiddleware);

aiRoutes.openapi(generatePreviewRoute, generatePreviewRouteHandler);
aiRoutes.openapi(legacyGenerateReviewRoute, generatePreviewRouteHandler);
aiRoutes.openapi(createGeneratePreviewJobRoute, createGeneratePreviewJobRouteHandler);
aiRoutes.openapi(getPreviewJobStatusRoute, getPreviewJobStatusRouteHandler);

export default aiRoutes;
