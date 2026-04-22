import { type DbClient, executeTransaction } from '@sentinel/db';

export async function executeExamTransaction<T>(callback: (trx: DbClient) => Promise<T>) {
    return await executeTransaction(callback, {
        maxWait: 10000,
        timeout: 15000,
    });
}
