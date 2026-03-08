import { type RouteConfig, type RouteHandler } from '@hono/zod-openapi';
import { users as User } from '../../generated/prisma';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { DbClient } from '../lib/create-db-client';

export type Variables = {
    user: User;
    supabaseUser: SupabaseUser;
    dbClient: DbClient;
    institutionId: string;
};

export type HonoEnv = {
    Variables: Variables;
};

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, HonoEnv>;
