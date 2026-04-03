import { type DbClient } from '@sentinel/db';
import { mapExamStatusToDb } from '../../assessment/assessment-contracts';
import { updateExamData } from '../data/update-exam';
import { getExamDetail } from './get-exam-detail';
import { requireExamRecord } from './require-exam-record';

export async function updateExamStatus(
    dbClient: DbClient,
    id: string,
    status: string,
    institutionId: string | undefined,
    userId: string,
) {
    requireExamRecord(
        await updateExamData({
            dbClient,
            id,
            institutionId,
            values: {
                status: mapExamStatusToDb(status as any) as any,
                published_at: status === 'published' ? new Date() : undefined,
                updated_at: new Date(),
                updated_by: userId,
            },
        }),
    );

    return await getExamDetail(dbClient, id, institutionId);
}
