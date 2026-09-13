import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { LoginSchema } from '@sentinel/shared/schema';
import { AuthService } from '../auth.service';
import { LogsService } from '../../../general/logs/logs.service';

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

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
    const credentials = c.req.valid('json');
    const dbClient = c.get('dbClient');
    const clientType = c.req.header('x-sentinel-client');
    try {
        const data = await AuthService.login(credentials, clientType);

        // Log successful login
        if (data.user) {
            try {
                const profile = await dbClient
                    .selectFrom('user_profiles')
                    .select(['institution_id'])
                    .where('user_id', '=', data.user.id)
                    .executeTakeFirst();

                if (profile?.institution_id) {
                    await LogsService.createLog(dbClient, {
                        userId: data.user.id,
                        action: 'auth.login',
                        resourceType: 'auth',
                        resourceId: data.user.id,
                        activeInstitutionId: profile.institution_id,
                        details: { email: credentials.email, success: true, method: 'credentials' },
                        ipAddress:
                            c.req.header('x-forwarded-for') ||
                            c.req.header('cf-connecting-ip') ||
                            null,
                    });
                }
            } catch (logErr) {
                console.error('Failed to log auth.login success:', logErr);
            }
        }

        return c.json(data);
    } catch (error: any) {
        // Log failed login
        try {
            const profile = await dbClient
                .selectFrom('auth.users as u')
                .innerJoin('user_profiles as up', 'up.user_id', 'u.id')
                .select(['up.user_id', 'up.institution_id'])
                .where('u.email', '=', credentials.email)
                .executeTakeFirst();

            if (profile?.institution_id) {
                await LogsService.createLog(dbClient, {
                    userId: profile.user_id,
                    action: 'auth.failed_login',
                    resourceType: 'auth',
                    resourceId: profile.user_id,
                    activeInstitutionId: profile.institution_id,
                    details: {
                        email: credentials.email,
                        success: false,
                        reason: error.message || 'invalid_credentials',
                    },
                    ipAddress:
                        c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || null,
                });
            }
        } catch (logErr) {
            console.error('Failed to log auth.login failure:', logErr);
        }

        return c.json({ error: error.message }, (error.status as any) || 400);
    }
};
