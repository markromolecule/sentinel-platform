import { type DbClient } from '@sentinel/db';
import { getExamByIdData } from '../data/get-exam-by-id';
import { deleteExamData } from '../data/delete-exam';
import { requireExamRecord } from './require-exam-record';
import { LogsService } from '../../../general/logs/logs.service';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';
import { assertExamOwnership } from './assert-exam-ownership';
import { type exams } from '@sentinel/db';

async function finalizeDeletedExam(
    dbClient: DbClient,
    deletedRecord: Pick<exams, 'exam_id' | 'room_id'>,
    institutionId?: string,
) {
    if (deletedRecord.room_id) {
        await recalculateRoomStatus(dbClient, deletedRecord.room_id);
    }

    if (institutionId) {
        try {
            await LogsService.createLog(dbClient, {
                action: 'exam.delete',
                resourceType: 'exam',
                resourceId: deletedRecord.exam_id,
                activeInstitutionId: institutionId,
                details: { exam_id: deletedRecord.exam_id },
            });
        } catch (logErr) {
            console.error('Failed to log exam.delete event:', logErr);
        }
    }
}

/**
 * Deletes an exam without running ownership checks. Intended for internal
 * cleanup flows such as classroom deletion where access has already been
 * authorized at the parent resource level.
 */
export async function deleteExamForCleanup(
    dbClient: DbClient,
    id: string,
    institutionId?: string,
) {
    const deletedRecord = await deleteExamData({
        dbClient,
        id,
        institutionId,
    });

    const record = requireExamRecord(deletedRecord);
    await finalizeDeletedExam(dbClient, record, institutionId);
}

/**
 * Deletes an exam after confirming the caller owns it or can bypass ownership.
 */
export async function deleteExam(
    dbClient: DbClient,
    id: string,
    institutionId: string | undefined,
    userId: string,
    canManageExam = false,
    role?: string,
) {
    const current = requireExamRecord(
        await getExamByIdData({
            dbClient,
            id,
            institutionId,
        }),
    );
    assertExamOwnership(current.created_by, userId, canManageExam, role);

    const deletedRecord = await deleteExamData({
        dbClient,
        id,
        institutionId,
    });

    const record = requireExamRecord(deletedRecord);
    await finalizeDeletedExam(dbClient, record, institutionId);
}
