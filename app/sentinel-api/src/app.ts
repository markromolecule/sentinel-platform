import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Database Imports
import { type DbClient, dbClient } from '@sentinel/db';
import { users as User } from '@sentinel/db';

// Route & Middleware Imports (Hoisted)
import { authMiddleware } from './middleware/auth';
import onboardingRouter from './modules/onboarding/onboarding.routes';
import departmentsRouter from './modules/departments/departments.routes';
import coursesRouter from './modules/courses/courses.routes';
import sectionsRouter from './modules/sections/sections.routes';
import subjectsRouter from './modules/subjects/subject.routes';
import usersRouter from './modules/users/user.routes';
import institutionsRouter from './modules/institutions/institution.routes';

type Variables = {
    user: User;
    supabaseUser: SupabaseUser;
    dbClient: DbClient;
};

const app = new OpenAPIHono<{ Variables: Variables }>();

// 1. CORS Configuration
app.use(
    '*',
    cors({
        origin: (origin) => {
            if (!origin) return 'https://core.sentinelph.tech';

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

            if (allowedOrigins.includes(origin)) return origin;

            const isAllowedDomain =
                origin.endsWith('.sentinelph.tech') || origin.endsWith('.vercel.app');
            if (isAllowedDomain) return origin;

            // Return null to actively deny unrecognized origins
            return null;
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

// 2. Database Client Injection
app.use('*', async (c, next) => {
    // Simplified: c.set is safe and lightweight
    c.set('dbClient', dbClient);
    await next();
});

// 3. Base Routes
app.get('/', (c) => c.text('Sentinel API'));

app.get('/me', authMiddleware, (c) => {
    return c.json({
        message: 'You are authenticated',
        user: c.get('user'),
    });
});

app.get('/heartbeat', authMiddleware, (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// 4. Feature Modules
app.route('/onboarding', onboardingRouter);
app.route('/departments', departmentsRouter);
app.route('/courses', coursesRouter);
app.route('/sections', sectionsRouter);
app.route('/subjects', subjectsRouter);
app.route('/users', usersRouter);
app.route('/institutions', institutionsRouter);

// 5. OpenAPI Specs & Documentation
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

// 6. Global Error Handling
app.onError((err, c) => {
    console.error('API Error:', err);

    if (err instanceof HTTPException) {
        return err.getResponse();
    }

    // Safely check for status code
    const status = 'status' in err ? (err as any).status : 500;

    return c.json(
        {
            error: err.name || 'Internal Server Error',
            message:
                process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : err.message,
        },
        status,
    );
});

// 7. 404 Handler
app.notFound((c) => {
    return c.json({ error: 'Not Found', message: `Route ${c.req.path} not found` }, 404);
});

export default app;
