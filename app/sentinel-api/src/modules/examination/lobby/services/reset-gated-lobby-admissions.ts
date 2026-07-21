import { type DbClient } from '@sentinel/db';

export type ResetGatedLobbyAdmissionsArgs = {
    dbClient: DbClient;
    examId: string;
};

/**
 * Resets existing lobby admissions to 'WAITING' when an exam transitions from
 * AUTOMATIC to INSTRUCTOR_GATED admission mode.
 *
 * Only affects students without an active 'IN_PROGRESS' attempt so that
 * legitimate active exam sessions are not disrupted. Clears decided_at and decided_by.
 *
 * @param args - Object containing dbClient and examId.
 * @returns The count of reset admission records.
 */
export async function resetGatedLobbyAdmissions({
    dbClient,
    examId,
}: ResetGatedLobbyAdmissionsArgs): Promise<number> {
    const result = await dbClient
        .updateTable('exam_lobby_admissions')
        .set({
            status: 'WAITING',
            decided_at: null,
            decided_by: null,
        })
        .where('exam_id', '=', examId)
        .where('status', '=', 'APPROVED')
        .where((eb) =>
            eb('student_id', 'not in', (sub) =>
                sub
                    .selectFrom('exam_attempts')
                    .select('student_id')
                    .where('exam_id', '=', examId)
                    .where('status', '=', 'IN_PROGRESS'),
            ),
        )
        .executeTakeFirst();

    return Number(result.numUpdatedRows ?? 0);
}
