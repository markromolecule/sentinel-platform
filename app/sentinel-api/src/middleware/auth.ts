import { Context, Next } from 'hono';
import { env } from 'hono/adapter';
import { verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { prisma, Prisma } from '@sentinel/db';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { type DbClient } from '@sentinel/db';

export type AppBindings = {
    Bindings: {
        SUPABASE_JWT_SECRET: string;
        SUPABASE_JWT_ALGORITHM?: string;
        SUPABASE_JWK?: string;
    };
    Variables: {
        user: Prisma.usersGetPayload<{ include: { user_profiles: true } }>;
        supabaseUser: SupabaseUser;
        institutionId: string;
        dbClient: DbClient;
    };
};

export const authMiddleware = async (c: Context<AppBindings>, next: Next) => {
    // 1. Handle CORS Preflight immediately
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
        throw new HTTPException(401, { message: 'Missing auth token' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');

    // 2. Extract Env Vars (Hono adapter compatible)
    const { SUPABASE_JWT_SECRET, SUPABASE_JWT_ALGORITHM, SUPABASE_JWK } = {
        ...env(c),
        ...process.env,
    };

    if (!SUPABASE_JWT_SECRET && !SUPABASE_JWK) {
        console.error('Missing SUPABASE_JWT_SECRET or SUPABASE_JWK');
        throw new HTTPException(500, { message: 'Server configuration error' });
    }

    let userId: string;

    // 3. Verify JWT
    try {
        let decodedPayload: any;
        if (SUPABASE_JWT_ALGORITHM === 'ES256' && typeof SUPABASE_JWK === 'string') {
            const jwk = JSON.parse(SUPABASE_JWK);
            const cryptoKey = await crypto.subtle.importKey(
                'jwk',
                jwk,
                { name: 'ECDSA', namedCurve: 'P-256' },
                true,
                ['verify'],
            );
            decodedPayload = await verify(token, cryptoKey as any, 'ES256');
        } else {
            decodedPayload = await verify(token, SUPABASE_JWT_SECRET!, 'HS256');
        }

        userId = decodedPayload.sub as string;
        c.set('supabaseUser', decodedPayload);
    } catch (error) {
        throw new HTTPException(401, { message: 'Invalid or expired token' });
    }

    // 4. Fetch User and Sync Institution Context
    try {
        const dbUser = await prisma.users.findUnique({
            where: { id: userId },
            include: { user_profiles: true },
        });

        if (!dbUser) {
            throw new HTTPException(401, { message: 'User record not found' });
        }

        c.set('user', dbUser);
        const institutionId = dbUser.user_profiles?.institution_id || '';
        c.set('institutionId', institutionId);

        // 5. Update Last Seen
        if (dbUser.user_profiles) {
            const now = new Date();
            const lastSeen = dbUser.user_profiles.last_seen_at;
            const fiveMinutes = 5 * 60 * 1000;

            if (!lastSeen || now.getTime() - lastSeen.getTime() > fiveMinutes) {
                // await directly for serverless stability
                try {
                    await prisma.user_profiles.update({
                        where: { user_id: userId },
                        data: { last_seen_at: now },
                    });
                } catch (e) {
                    console.error('Failed to update last_seen_at:', e);
                }
            }
        }
    } catch (dbError) {
        if (dbError instanceof HTTPException) throw dbError;
        console.error('Auth Database Error:', dbError);
        throw new HTTPException(500, { message: 'Database Connection Error' });
    }

    return await next();
};
