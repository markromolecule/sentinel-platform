import { type DbClient } from '@sentinel/db';
import { deleteExamData } from '../data/delete-exam';
import { requireExamRecord } from './require-exam-record';

export async function deleteExam(dbClient: DbClient, id: string, institutionId?: string) {
    requireExamRecord(
        await deleteExamData({
            dbClient,
            id,
            institutionId,
        }),
    );
}
