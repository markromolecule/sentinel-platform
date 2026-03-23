import 'dotenv/config';
import { Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
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
                'http://localhost:3002',
                'https://sentinel-coral.vercel.app',
                'https://app.sentinelph.tech',
                'https://sentinelph.tech',
                'https://www.sentinelph.tech',
                'https://core.sentinelph.tech',
            ];
            // Allow Vercel preview deployments and all sentinelph.tech subdomains
            if (origin && (origin.endsWith('.vercel.app') || origin.endsWith('.sentinelph.tech') || origin === 'https://sentinelph.tech')) {
                return origin;
            }
            if (origin && allowedOrigins.includes(origin)) {
                return origin;
            }
            return allowedOrigins[0];
        },
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
        exposeHeaders: ['Content-Length'],
        maxAge: 600,
        credentials: true,
    }),
);

// Inject dbClient into the context
app.use('*', async (c, next) => {
    if (!c.get('dbClient')) {
        c.set('dbClient', dbClient);
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
        timestamp: new Date().toISOString()
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
    // Use dynamic import to prevent esbuild/tsc from transpiling this to require() in CJS builds.
    const scalar = await Function(`return import('@scalar/hono-api-reference')`)();
    return scalar.apiReference({
        spec: { url: '/doc' },
    } as any)(c, next);
});

export default app;
