import { withAccelerate } from '@prisma/extension-accelerate';
import {
    PrismaClient,
    Prisma,
    type users as PrismaUser,
    type user_profiles as PrismaUserProfile,
} from '../generated/client';
export { Prisma };
export type { PrismaUser, PrismaUserProfile };
import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import type { DB } from './generated/types';

const createClient = () => {
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    const connectionUrl = databaseUrl || directUrl;

    const options: any = {
        log: ['error', 'warn'],
    };

    if (connectionUrl?.startsWith('prisma://')) {
        options.accelerateUrl = connectionUrl;
    } else if (connectionUrl) {
        options.datasources = {
            db: {
                url: connectionUrl,
            },
        };
    }

    return new PrismaClient(options).$extends(withAccelerate()).$extends(
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
