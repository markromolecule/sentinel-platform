import { PrismaClient, Prisma } from '../generated/client';
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import type { DB } from './generated/types';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const createClient = () => {
    const connectionUrl = process.env.DATABASE_URL;

    if (!connectionUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    if (connectionUrl.startsWith('prisma://')) {
        throw new Error(
            'Prisma Accelerate (prisma://) URLs are incompatible with Kysely. Please use a standard postgresql:// pooler URL in your environment variables.',
        );
    }

    // 1. Define base options
    const prismaOptions: any = {
        log: ['error', 'warn'],
    };

    console.log(
        `Prisma: Initializing via standard Pg Driver Adapter (${process.env.NODE_ENV || 'development'})`,
    );

    // 2. Initialize the standard connection pool
    const pool = new Pool({
        connectionString: connectionUrl,
        max: 1,
        idleTimeoutMillis: 1,
        ssl:
            connectionUrl.includes('supabase.co') || connectionUrl.includes('pooler.supabase.com')
                ? { rejectUnauthorized: false }
                : false,
    });

    // 3. Initialize Prisma 7 strictly with the adapter
    const baseClient = new PrismaClient({
        ...prismaOptions,
        adapter: new PrismaPg(pool),
    });

    // 4. Attach Kysely Extension
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
