import { type RouteConfig, type RouteHandler } from '@hono/zod-openapi';
import { Prisma } from '@sentinel/db';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { DbClient } from '@sentinel/db';

export type Variables = {
    user: Prisma.usersGetPayload<{ include: { user_profiles: true } }>;
    supabaseUser: SupabaseUser;
    dbClient: DbClient;
    institutionId: string;
};

export type HonoEnv = {
    Variables: Variables;
};

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, HonoEnv>;
