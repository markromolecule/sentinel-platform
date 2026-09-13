import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { ApiRegisterSchema } from '@sentinel/shared/schema';
import { AuthService } from '../auth.service';
import { LogsService } from '../../../general/logs/logs.service';

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
                    schema: ApiRegisterSchema,
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

export const registerHandler: AppRouteHandler<typeof registerRoute> = async (c) => {
    const dbClient = c.get('dbClient');
    try {
        const body = c.req.valid('json');
        const data = await AuthService.register(body);

        // Log successful registration
        if (data.user) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: data.user.id,
                    action: 'auth.register',
                    resourceType: 'auth',
                    resourceId: data.user.id,
                    activeInstitutionId: '00000000-0000-0000-0000-000000000000', // System default placeholder for new signups
                    details: {
                        email: body.email,
                        role: 'student',
                        firstName: body.firstName,
                        lastName: body.lastName,
                    },
                    ipAddress:
                        c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || null,
                });
            } catch (logErr) {
                console.error('Failed to log auth.register success:', logErr);
            }
        }

        return c.json(data);
    } catch (error: any) {
        return c.json({ error: error.message }, (error.status as any) || 400);
    }
};
