import { Context, Next } from 'hono';
import { env } from 'hono/adapter';
import { verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { prisma, Prisma } from '@sentinel/db';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { type DbClient } from '@sentinel/db';

// 1. Define strict types for your environment variables and context variables
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
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
        throw new HTTPException(401, { message: 'Missing auth token' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');

    // 2. Safely extract environment variables
    const { SUPABASE_JWT_SECRET, SUPABASE_JWT_ALGORITHM, SUPABASE_JWK } = {
        ...env(c),
        ...process.env,
    };

    if (!SUPABASE_JWT_SECRET && !SUPABASE_JWK) {
        console.error('Missing SUPABASE_JWT_SECRET or SUPABASE_JWK in environment variables');
        throw new HTTPException(500, { message: 'Server configuration error' });
    }

    let userId: string;
    // 3. Verify the token locally
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
            decodedPayload = await verify(token, SUPABASE_JWT_SECRET, 'HS256');
        }
        // Supabase stores the user's UUID in the 'sub' claim
        userId = decodedPayload.sub as string;

        // Attach the decoded payload as supabaseUser for role-based checks
        c.set('supabaseUser', decodedPayload);
    } catch (error) {
        throw new HTTPException(401, { message: 'Invalid or expired token' });
    }

    // 4. Sync with Prisma
    try {
        const dbUser = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                user_profiles: true,
            },
        });

        if (!dbUser) {
            console.error(`User ${userId} found in token but not in DB`);
            throw new HTTPException(401, { message: 'User record not found' });
        }

        // 5. Attach strictly-typed data to the context
        c.set('user', dbUser);
        const institutionId = dbUser.user_profiles?.institution_id;

        if (!institutionId) {
            console.warn(
                `[AuthMiddleware] User ${userId} (${dbUser.email}) has NO associated institution_id in public.user_profiles. WRITES will fail with 403.`,
            );
        } else {
            console.log(
                `[AuthMiddleware] User ${userId} authenticated for institution: ${institutionId}`,
            );
        }

        c.set('institutionId', institutionId || '');

        // 6. Background task for 'last_seen_at'
        if (dbUser.user_profiles) {
            const now = new Date();
            const lastSeen = dbUser.user_profiles.last_seen_at;
            const fiveMinutes = 5 * 60 * 1000;

            if (!lastSeen || now.getTime() - lastSeen.getTime() > fiveMinutes) {
                const updateLastSeen = async () => {
                    try {
                        await prisma.user_profiles.update({
                            where: { user_id: userId },
                            data: { last_seen_at: now },
                        });
                    } catch (e) {
                        console.error('Failed to update last_seen_at:', e);
                    }
                };

                // Safely handle background tasks across different runtimes
                let executionCtx: any;
                try {
                    executionCtx = (c as any).executionCtx;
                } catch {
                    // No executionContext available
                }

                if (executionCtx?.waitUntil) {
                    executionCtx.waitUntil(updateLastSeen());
                } else {
                    updateLastSeen().catch((e) => console.error('Background task error:', e));
                }
            }
        }
    } catch (dbError) {
        if (dbError instanceof HTTPException) throw dbError;
        console.error('Database Error:', dbError);
        throw new HTTPException(500, { message: 'Database Connection Error' });
    }

    await next();
};
