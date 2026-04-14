import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';

import {
    verifyEligibilityRoute,
    verifyEligibilityRouteHandler,
} from './controllers/verify-eligibility.controller';
import { authMiddleware } from '../../../middleware/auth';

const accessRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to ensure only valid student tokens can verify eligibility
accessRoutes.use('*', authMiddleware);

accessRoutes.openapi(verifyEligibilityRoute, verifyEligibilityRouteHandler);

export default accessRoutes;
