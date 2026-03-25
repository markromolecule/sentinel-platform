import { PrismaClient, Prisma } from '../generated/client';
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import type { DB } from './generated/types';

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
        `Prisma: Initializing via Native Engine (${process.env.NODE_ENV || 'development'})`,
    );

    // 2. Initialize Prisma strictly with its native engine
    // This allows Prisma to respect the ?pgbouncer=true flag for the Supabase Transaction Pooler
    const baseClient = new PrismaClient({
        ...prismaOptions,
    });

    // 3. Attach Kysely Extension
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
