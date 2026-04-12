import { type RouteConfig, type RouteHandler } from '@hono/zod-openapi';
import { Prisma } from '@sentinel/db';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { DbClient } from '@sentinel/db';

export type Variables = {
    user: Prisma.usersGetPayload<{ include: { user_profiles: true } }>;
    supabaseUser: SupabaseUser;
    dbClient: DbClient;
    institutionId: string;
    activePermissionKeys: string[];
};

export type HonoEnv = {
    Bindings: {
        SUPABASE_JWT_SECRET: string;
        SUPABASE_JWT_ALGORITHM?: string;
        SUPABASE_JWK?: string;
    };
    Variables: Variables;
};

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, HonoEnv>;
