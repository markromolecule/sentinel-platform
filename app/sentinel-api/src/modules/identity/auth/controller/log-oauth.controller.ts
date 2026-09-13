import { createRoute, z } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { LogsService } from '../../../general/logs/logs.service';

export const logOauthRoute = createRoute({
    method: 'post',
    path: '/log-oauth',
    tags: ['Auth'],
    summary: 'Log Successful OAuth Login',
    description: 'Logs a successful OAuth provider login event.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        provider: z.string().default('google_oauth'),
                    }),
                },
            },
        },
    },
    responses: {
        200: { description: 'Successful logging' },
        401: { description: 'Unauthorized' },
    },
});

export const logOauthHandler: AppRouteHandler<typeof logOauthRoute> = async (c) => {
    const { provider } = c.req.valid('json');
    const dbClient = c.get('dbClient');
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    if (user && institutionId) {
        try {
            await LogsService.createLog(dbClient, {
                userId: user.id,
                action: 'auth.login',
                resourceType: 'auth',
                resourceId: user.id,
                activeInstitutionId: institutionId,
                details: { email: user.email, success: true, method: provider },
                ipAddress:
                    c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || null,
            });
        } catch (logErr) {
            console.error('Failed to log auth.login oauth success:', logErr);
        }
    }

    return c.json({ success: true });
};
