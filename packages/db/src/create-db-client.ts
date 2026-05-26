import { prisma, type Prisma } from './db';

/**
 * Shared Kysely database query client instance.
 * Provides type-safe querying leveraging the Kysely query builder and auto-generated database types.
 */
export const dbClient = prisma.$kysely;

export type DbClient = typeof dbClient;
export type TransactionOptions = {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
};

/**
 * Execute a transaction using Prisma's $transaction while staying within the Kysely ecosystem
 * for queries. This is necessary because the prisma-extension-kysely driver doesn't support
 * native Kysely transactions.
 */
export async function executeTransaction<T>(
    callback: (trx: DbClient) => Promise<T>,
    options?: TransactionOptions,
): Promise<T> {
    return await prisma.$transaction(async (tx) => {
        const trx = (tx as any).$kysely as DbClient;
        return await callback(trx);
    }, options);
}
