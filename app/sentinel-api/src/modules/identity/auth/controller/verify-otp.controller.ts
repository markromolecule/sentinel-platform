import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { VerifyOtpSchema } from '@sentinel/shared/schema';
import { AuthService } from '../auth.service';
import { LogsService } from '../../../general/logs/logs.service';

export const verifyOtpRoute = createRoute({
    method: 'post',
    path: '/verify-otp',
    tags: ['Auth'],
    summary: 'Verify Email OTP',
    description: 'Verify 6-digit email confirmation OTP code with Supabase.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: VerifyOtpSchema,
                },
            },
        },
    },
    responses: {
        200: { description: 'Successful OTP verification' },
        400: { description: 'Invalid or expired OTP code' },
        429: { description: 'Too many OTP verification attempts' },
    },
});

export const verifyOtpHandler: AppRouteHandler<typeof verifyOtpRoute> = async (c) => {
    const dbClient = c.get('dbClient');
    try {
        const body = c.req.valid('json');
        const data = await AuthService.verifyOtp(body);

        if (data.user) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: data.user.id,
                    action: 'auth.verify_otp',
                    resourceType: 'auth',
                    resourceId: data.user.id,
                    activeInstitutionId: '00000000-0000-0000-0000-000000000000',
                    details: {
                        email: body.email,
                        success: true,
                        type: body.type,
                    },
                    ipAddress:
                        c.req.header('x-forwarded-for') ||
                        c.req.header('cf-connecting-ip') ||
                        null,
                });
            } catch (logErr) {
                console.error('Failed to log auth.verify_otp success:', logErr);
            }
        }

        return c.json(data);
    } catch (error: any) {
        return c.json({ error: error.message }, (error.status as any) || 400);
    }
};
