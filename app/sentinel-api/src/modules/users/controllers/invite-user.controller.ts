import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { inviteUserSchema } from '../user.dto';
import { UserService } from '../user.service';

export const inviteUserRoute = createRoute({
    method: 'post',
    path: '/invite',
    tags: ['Users'],
    summary: 'Invite an Admin/Instructor',
    description: 'Invites a new admin or instructor via Supabase auth.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: inviteUserSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: inviteUserSchema.response,
                },
            },
            description: 'User invited successfully',
        },
        400: { description: 'Bad Request' },
        403: { description: 'Forbidden' },
        409: { description: 'User already exists' },
        500: { description: 'Internal Server Error' },
    },
});

export const inviteUserRouteHandler: AppRouteHandler<typeof inviteUserRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role !== 'superadmin' && role !== 'admin') {
            return c.json({ error: 'Unauthorized to invite users' } as any, 403);
        }

        const originHeader = c.req.header('origin');
        const refererHeader = c.req.header('referer');
        const forwardedProto = c.req.header('x-forwarded-proto');
        const forwardedHost = c.req.header('x-forwarded-host') || c.req.header('host');

        let requestOrigin = originHeader;

        if (!requestOrigin && refererHeader) {
            try {
                requestOrigin = new URL(refererHeader).origin;
            } catch {
                requestOrigin = undefined;
            }
        }

        if (!requestOrigin && forwardedProto && forwardedHost) {
            requestOrigin = `${forwardedProto}://${forwardedHost}`;
        }

        const user = await UserService.inviteUser(c.get('dbClient'), body, requestOrigin);

        return c.json(
            {
                message: 'User invited successfully',
                data: user,
            },
            201,
        );
    } catch (error: any) {
        console.error('Invite user error:', error);
        return c.json(
            { error: error?.message || 'Internal Server Error' } as any,
            error?.status || 500,
        );
    }
};
