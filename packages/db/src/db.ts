import { PrismaClient, Prisma } from '../generated/client';
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import type { DB } from './generated/types';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const createClient = () => {
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const isAccelerate = databaseUrl.startsWith('prisma://');
    const useDirect =
        !!directUrl &&
        (isAccelerate || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test');

    const connectionUrl = useDirect ? directUrl! : databaseUrl;

    // 1. Define base options
    const prismaOptions: any = {
        log: ['error', 'warn'],
    };

    // 2. Route connection based on Prisma v7 requirements
    if (isAccelerate && !useDirect) {
        // Use accelerateUrl for Prisma Accelerate connections
        prismaOptions.accelerateUrl = connectionUrl;
    } else {
        // Use a Driver Adapter for direct Postgres connections
        const pool = new Pool({ connectionString: connectionUrl });
        prismaOptions.adapter = new PrismaPg(pool);
    }

    const baseClient = new PrismaClient(prismaOptions);

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
