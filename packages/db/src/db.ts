import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient, Prisma } from '../generated/client';
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import type { DB } from './generated/types';

const createClient = () => {
    return new PrismaClient({
        log: ['error', 'warn'],
        accelerateUrl: process.env.DATABASE_URL,
    })
        .$extends(withAccelerate())
        .$extends(
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
