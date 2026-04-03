import { prisma, type DbClient } from '@sentinel/db';

export async function executeExamTransaction<T>(callback: (trx: DbClient) => Promise<T>) {
    return await prisma.$transaction(async (transactionClient) => {
        return await callback(
            (transactionClient as typeof transactionClient & { $kysely: DbClient }).$kysely,
        );
    });
}
