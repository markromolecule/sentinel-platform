// Only load dotenv in non-production environments or if it's available
if (process.env.NODE_ENV !== 'production') {
    try {
        // Use a dynamic check or just assume it's there in local
        // In local 'dev' script uses tsx which can handle this,
        // but we'll be safe for any environment.
        require('dotenv').config();
    } catch {
        // Silently fail if dotenv is missing (e.g. in some CI/CD or production-like local setups)
    }
}
import { Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';

import { User as SupabaseUser } from '@supabase/supabase-js';
import { authMiddleware } from './middleware/auth';
import { type DbClient, dbClient } from '@sentinel/db';
import { users as User } from '@sentinel/db';

type Variables = {
    user: User;
    supabaseUser: SupabaseUser;
    dbClient: DbClient;
};

const app = new OpenAPIHono<{ Variables: Variables }>();

// CORS configuration (Must be first to handle preflights)
app.use(
    '*',
    cors({
        origin: (origin) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002',
                'https://sentinel-coral.vercel.app',
                'https://app.sentinelph.tech',
                'https://sentinelph.tech',
                'https://www.sentinelph.tech',
                'https://core.sentinelph.tech',
            ];

            // If no origin is provided (e.g. same-origin or non-browser request),
            // we'll return the production app URL for consistency in production environments.
            if (!origin) return 'https://core.sentinelph.tech';

            // Exact match in the allowed list
            if (allowedOrigins.includes(origin)) return origin;

            // Robust subdomain check for sentinelph.tech and vercel previews
            const isAllowedDomain =
                origin.endsWith('.sentinelph.tech') || origin.endsWith('.vercel.app');

            if (isAllowedDomain) return origin;

            // Default fallback for unmatched origins
            return 'http://localhost:3000';
        },
        allowHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'apikey',
            'x-client-info',
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        exposeHeaders: ['Content-Length', 'X-Kysely-Query'],
        maxAge: 600,
        credentials: true,
    }),
);

// Inject dbClient into the context
app.use('*', async (c, next) => {
    // Skip for OPTIONS requests
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    try {
        if (!c.get('dbClient')) {
            c.set('dbClient', dbClient);
        }
    } catch (e) {
        console.error('Failed to inject dbClient into context:', e);
    }
    await next();
});

// Routes
app.get('/', (c) => {
    return c.text('Sentinel API');
});

import onboardingRouter from './modules/onboarding/onboarding.routes';
app.route('/onboarding', onboardingRouter);

import departmentsRouter from './modules/departments/departments.routes';
app.route('/departments', departmentsRouter);

import coursesRouter from './modules/courses/courses.routes';
app.route('/courses', coursesRouter);

import sectionsRouter from './modules/sections/sections.routes';
app.route('/sections', sectionsRouter);

import subjectsRouter from './modules/subjects/subject.routes';
app.route('/subjects', subjectsRouter);

import examsRouter from './modules/exam/exam.controller';
app.route('/exams', examsRouter);

import usersRouter from './modules/users/user.routes';
app.route('/users', usersRouter);

import institutionsRouter from './modules/institutions/institution.routes';
app.route('/institutions', institutionsRouter);

app.get('/me', authMiddleware, (c) => {
    const user = c.get('user');
    return c.json({
        message: 'You are authenticated',
        user,
    });
});

app.get('/heartbeat', authMiddleware, (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Export the app instance (used by both server.ts and api/index.ts)
// OpenAPI endpoint for JSON specs
app.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'Sentinel API Documentation',
    },
});

// Scalar API Reference UI
app.get('/reference', async (c, next) => {
    // Dynamic import
    const scalar = await Function(`return import('@scalar/hono-api-reference')`)();
    return scalar.apiReference({
        spec: { url: '/doc' },
    } as any)(c, next);
});

// Global error handling
app.onError((err, c) => {
    console.error('API Error:', err);

    // Check if it's an HTTPException
    if (err instanceof HTTPException) {
        return err.getResponse();
    }

    // Handle other types of errors (like those from Prisma or generic Errors)
    const status = (err as any).status || (err as any).statusCode || 500;

    return c.json(
        {
            error: err.name || 'Internal Server Error',
            message:
                process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : err.message,
        },
        status as any,
    );
});

app.notFound((c) => {
    return c.json({ error: 'Not Found', message: `Route ${c.req.path} not found` }, 404);
});

export default app;
