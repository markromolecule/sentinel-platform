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

    const prismaOptions: any = {
        log: ['error', 'warn'],
    };

    // Determine if the connection is to a local database
    const isLocal =
        connectionUrl.includes('localhost') ||
        connectionUrl.includes('127.0.0.1') ||
        connectionUrl.includes('host.docker.internal') ||
        connectionUrl.includes('//db:') ||
        connectionUrl.includes('@db:') ||
        connectionUrl.includes('sslmode=disable');

    // 1. Initialize the standard connection pool with a strict limit
    const pool = new Pool({
        connectionString: connectionUrl,
        max: 3, // allow multiple sequential queries per handler (create/update use 2 calls)
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
        ssl: isLocal ? false : { rejectUnauthorized: false },
    });

    // 2. Initialize Prisma 7 strictly with the required adapter
    const baseClient = new PrismaClient({
        ...prismaOptions,
        adapter: new PrismaPg(pool),
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

export type PrismaKyselyClient = ReturnType<typeof createClient>;
export { Prisma };

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaKyselyClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
