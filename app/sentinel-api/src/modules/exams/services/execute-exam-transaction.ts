import { type DbClient, executeTransaction } from '@sentinel/db';

export async function executeExamTransaction<T>(callback: (trx: DbClient) => Promise<T>) {
    return await executeTransaction(callback);
}
