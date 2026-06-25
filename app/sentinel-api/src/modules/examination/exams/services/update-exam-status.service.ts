import { type DbClient } from '@sentinel/db';
import { mapExamStatusToDb } from '../../assessment/assessment-contracts';
import { updateExamData } from '../data/update-exam';
import { getExamDetail } from './get-exam-detail.service';
import { requireExamRecord } from './require-exam-record.service';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';

export async function updateExamStatus(
    dbClient: DbClient,
    id: string,
    status: string,
    institutionId: string | undefined,
    userId: string,
) {
    const updated = requireExamRecord(
        await updateExamData({
            dbClient,
            id,
            institutionId,
            values: {
                status: mapExamStatusToDb(status as any) as any,
                published_at: status === 'published' ? new Date() : null,
                published_by: status === 'published' ? userId : null,
                updated_at: new Date(),
                updated_by: userId,
            },
        }),
    );

    if (updated.room_id) {
        await recalculateRoomStatus(dbClient, updated.room_id);
    }

    return await getExamDetail(dbClient, id, institutionId);
}
