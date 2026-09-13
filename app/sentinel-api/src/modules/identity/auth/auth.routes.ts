import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { createRateLimitMiddleware } from '../../../middleware/rate-limit';
import { authMiddleware } from '../../../middleware/auth';
import { loginRoute, loginHandler } from './controller/login.controller';
import { registerRoute, registerHandler } from './controller/register.controller';
import { verifyOtpRoute, verifyOtpHandler } from './controller/verify-otp.controller';
import { logOauthRoute, logOauthHandler } from './controller/log-oauth.controller';

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
    limit: 10,
    windowSeconds: 15 * 60,
    prefix: 'rl:auth:register',
});

const verifyOtpRateLimit = createRateLimitMiddleware({
    limit: 10,
    windowSeconds: 15 * 60,
    prefix: 'rl:auth:verify-otp',
});

// Apply auth middleware only for the OAuth successful logging hook
authRoutes.use('/log-oauth', authMiddleware);

// Apply rate limits to paths
authRoutes.use(loginRoute.path, loginRateLimit);
authRoutes.use(registerRoute.path, registerRateLimit);
authRoutes.use(verifyOtpRoute.path, verifyOtpRateLimit);

// ----------------------------------------------------------------------------
// Route Registration (Traffic Director)
// ----------------------------------------------------------------------------

authRoutes
    .openapi(loginRoute, loginHandler)
    .openapi(registerRoute, registerHandler)
    .openapi(verifyOtpRoute, verifyOtpHandler)
    .openapi(logOauthRoute, logOauthHandler);

export default authRoutes;
