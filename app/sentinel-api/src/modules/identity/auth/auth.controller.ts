import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { LoginSchema, RegisterSchema } from '@sentinel/shared/schema';
import { AuthService } from './auth.service';

// ----------------------------------------------------------------------------
// Route Definitions
// ----------------------------------------------------------------------------

export const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    tags: ['Auth'],
    summary: 'Login Proxy',
    description: 'Proxy login requests to Supabase with rate limiting.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginSchema,
                },
            },
        },
    },
    responses: {
        200: { description: 'Successful login' },
        400: { description: 'Invalid credentials or request' },
        429: { description: 'Too many login attempts' },
    },
});

export const registerRoute = createRoute({
    method: 'post',
    path: '/register',
    tags: ['Auth'],
    summary: 'Register Proxy',
    description: 'Proxy registration requests to Supabase with rate limiting.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: RegisterSchema,
                },
            },
        },
    },
    responses: {
        200: { description: 'Successful registration' },
        400: { description: 'Invalid data' },
        429: { description: 'Too many registration attempts' },
    },
});

// ----------------------------------------------------------------------------
// Route Handlers
// ----------------------------------------------------------------------------

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
    try {
        const credentials = c.req.valid('json');
        const data = await AuthService.login(credentials);
        return c.json(data);
    } catch (error: any) {
        return c.json({ error: error.message }, (error.status as any) || 400);
    }
};

export const registerHandler: AppRouteHandler<typeof registerRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const data = await AuthService.register(body);
        return c.json(data);
    } catch (error: any) {
        return c.json({ error: error.message }, (error.status as any) || 400);
    }
};
