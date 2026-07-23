import { type DbClient } from '@sentinel/db';

/**
 * Checks whether an exam has a remediation schedule attached.
 * Used to determine if a fresh attempt should be allowed for makeup/retake overrides.
 */
export async function findRemediationSchedule(db: DbClient, examId: string) {
    return await db
        .selectFrom('exam_remediation_schedules')
        .select('remediation_id')
        .where('remediation_exam_id', '=', examId)
        .executeTakeFirst();
}
