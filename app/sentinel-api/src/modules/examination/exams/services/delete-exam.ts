import { type DbClient } from '@sentinel/db';
import { getExamByIdData } from '../data/get-exam-by-id';
import { deleteExamData } from '../data/delete-exam';
import { requireExamRecord } from './require-exam-record';
import { LogsService } from '../../../general/logs/logs.service';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';
import { assertExamOwnership } from './assert-exam-ownership';

/**
 * Deletes an exam after confirming the caller owns it or can bypass ownership.
 */
export async function deleteExam(
    dbClient: DbClient,
    id: string,
    institutionId: string | undefined,
    userId: string,
    role?: string,
) {
    const current = requireExamRecord(
        await getExamByIdData({
            dbClient,
            id,
            institutionId,
        }),
    );
    assertExamOwnership(current.created_by, userId, role);

    const deletedRecord = await deleteExamData({
        dbClient,
        id,
        institutionId,
    });

    const record = requireExamRecord(deletedRecord);

    if (record.room_id) {
        await recalculateRoomStatus(dbClient, record.room_id);
    }

    // Real-time Audit Logging integration
    if (institutionId) {
        try {
            await LogsService.createLog(dbClient, {
                action: 'exam.delete',
                resourceType: 'exam',
                resourceId: id,
                activeInstitutionId: institutionId,
                details: { exam_id: id },
            });
        } catch (logErr) {
            console.error('Failed to log exam.delete event:', logErr);
        }
    }
}
