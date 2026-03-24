import { PrismaClient, Prisma } from '../generated/client';
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import type { DB } from './generated/types';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';

const createClient = () => {
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const isAccelerate = databaseUrl.startsWith('prisma://');
    
    // Explicitly allow forcing driver adapter (useful for Kysely in Production)
    const forceDriverAdapter = process.env.FORCE_DRIVER_ADAPTER === 'true';
    
    // Use Driver Adapter if:
    // 1. We are in development/test
    // 2. We explicitly force it via env
    // 3. The URL is NOT an accelerate URL (starts with postgres://)
    const useDriverAdapter =
        process.env.NODE_ENV !== 'production' || forceDriverAdapter || !isAccelerate;

    const connectionUrl = (useDriverAdapter && !!directUrl) ? directUrl : databaseUrl;

    // 1. Define base options
    const prismaOptions: any = {
        log: ['error', 'warn'],
    };

    // 2. Route connection based on Prisma v7 requirements
    let baseClient: PrismaClient;

    if (isAccelerate && !useDriverAdapter) {
        // Use datasourceUrl for Prisma 7 Accelerate connections
        console.log('Prisma: Initializing with Accelerate (Production)');
        baseClient = new PrismaClient({
            ...prismaOptions,
            datasourceUrl: connectionUrl,
        }).$extends(withAccelerate()) as any;
    } else {
        // Use a Driver Adapter for standard Postgres connections (including Pooled/Supavisor)
        console.log(
            `Prisma: Initializing with ${isAccelerate ? 'Accelerate URL (as Direct)' : 'Standard Connection'} via Driver Adapter (${process.env.NODE_ENV || 'development'})`,
        );

        const pool = new Pool({
            connectionString: connectionUrl,
            ssl:
                connectionUrl.includes('supabase.co') ||
                connectionUrl.includes('pooler.supabase.com')
                    ? { rejectUnauthorized: false }
                    : false,
        });

        baseClient = new PrismaClient({
            ...prismaOptions,
            adapter: new PrismaPg(pool),
        });
    }

    return baseClient.$extends(
        kyselyExtension<DB>({
            kysely: (driver) =>
                new Kysely<DB>({
                    dialect: {
                        createDriver: () => driver,
                        createAdapter: () => new PostgresAdapter(),
                        createIntrospector: (db) => new PostgresIntrospector(db),
                        createQueryCompiler: () => new PostgresQueryCompiler(),
                    },
                }),
        }),
    );
};

// export the client type
export type PrismaKyselyClient = ReturnType<typeof createClient>;
export { Prisma };

// hot-reload fix for prisma
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaKyselyClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
