import { type DbClient } from '@sentinel/db';
import type { LobbyAdmissionDecisionStatus } from '../lobby.dto';

export const updateAdmissions = async (
    dbClient: DbClient,
    examId: string,
    studentIds: string[],
    status: LobbyAdmissionDecisionStatus,
    instructorId?: string,
) => {
    const result = await dbClient
        .updateTable('exam_lobby_admissions')
        .set({
            status: status as any,
            decided_at: new Date(),
            decided_by: instructorId ?? null,
        })
        .where('exam_id', '=', examId)
        .where('student_id', 'in', studentIds)
        .executeTakeFirst();

    return { updatedCount: Number(result.numUpdatedRows) };
};
