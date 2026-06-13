import { type DbClient } from '@sentinel/db';
import { deleteExamData } from '../data/delete-exam';
import { requireExamRecord } from './require-exam-record';
import { LogsService } from '../../../general/logs/logs.service';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';

export async function deleteExam(dbClient: DbClient, id: string, institutionId?: string) {
    const deletedRecord = await deleteExamData({
        dbClient,
        id,
        institutionId,
    });

    requireExamRecord(deletedRecord);

    if (deletedRecord.room_id) {
        await recalculateRoomStatus(dbClient, deletedRecord.room_id);
    }

    // Real-time Audit Logging integration
    if (deletedRecord && institutionId) {
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
