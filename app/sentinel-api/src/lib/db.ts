import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '../../generated/prisma';
import {
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import type { DB } from './types';

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

export type PrismaKyselyClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaKyselyClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
