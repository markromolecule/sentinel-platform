import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { createRateLimitMiddleware } from '../../../middleware/rate-limit';
import { authMiddleware } from '../../../middleware/auth';
import {
    loginRoute,
    loginHandler,
    registerRoute,
    registerHandler,
    logOauthRoute,
    logOauthHandler,
} from './auth.controller';

const authRoutes = new OpenAPIHono<HonoEnv>();

// ----------------------------------------------------------------------------
// Rate Limit Configurations
// ----------------------------------------------------------------------------

const loginRateLimit = createRateLimitMiddleware({
    limit: 5,
    windowSeconds: 15 * 60,
    prefix: 'rl:auth:login',
});

const registerRateLimit = createRateLimitMiddleware({
    limit: 3,
    windowSeconds: 60 * 60,
    prefix: 'rl:auth:register',
});

// Apply auth middleware only for the OAuth successful logging hook
authRoutes.use('/log-oauth', authMiddleware);

// Apply rate limits to paths
authRoutes.use(loginRoute.path, loginRateLimit);
authRoutes.use(registerRoute.path, registerRateLimit);

// ----------------------------------------------------------------------------
// Route Registration (Traffic Director)
// ----------------------------------------------------------------------------

authRoutes
    .openapi(loginRoute, loginHandler)
    .openapi(registerRoute, registerHandler)
    .openapi(logOauthRoute, logOauthHandler);

export default authRoutes;
