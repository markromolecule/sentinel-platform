import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export const checkInLobby = async (dbClient: DbClient, examId: string, studentId: string) => {
    const exam = await dbClient
        .selectFrom('exams as e')
        .leftJoin('exam_configurations as ec', 'e.exam_id', 'ec.exam_id')
        .select(['e.exam_id', 'ec.lobby_admission_mode'])
        .where('e.exam_id', '=', examId)
        .executeTakeFirst();

    if (!exam) {
        throw new HTTPException(404, { message: 'Exam not found' });
    }

    const mode = exam.lobby_admission_mode ?? 'AUTOMATIC';

    const existingAdmission = await dbClient
        .selectFrom('exam_lobby_admissions')
        .selectAll()
        .where('exam_id', '=', examId)
        .where('student_id', '=', studentId)
        .executeTakeFirst();

    if (existingAdmission) {
        if (mode === 'AUTOMATIC' && existingAdmission.status !== 'APPROVED') {
            const updatedAdmission = await dbClient
                .updateTable('exam_lobby_admissions')
                .set({
                    status: 'APPROVED',
                    decided_at: new Date(),
                })
                .where('admission_id', '=', existingAdmission.admission_id)
                .returningAll()
                .executeTakeFirstOrThrow();

            return {
                status: updatedAdmission.status ?? 'WAITING',
                checkedInAt:
                    updatedAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
            };
        }

        return {
            status: existingAdmission.status ?? 'WAITING',
            checkedInAt: existingAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
        };
    }

    const now = new Date();
    const newAdmission = await dbClient
        .insertInto('exam_lobby_admissions')
        .values({
            exam_id: examId,
            student_id: studentId,
            status: mode === 'AUTOMATIC' ? 'APPROVED' : 'WAITING',
            checked_in_at: now,
            decided_at: mode === 'AUTOMATIC' ? now : null,
        })
        .onConflict((oc) =>
            oc.columns(['exam_id', 'student_id']).doUpdateSet({
                checked_in_at: now,
            }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    return {
        status: newAdmission.status ?? 'WAITING',
        checkedInAt: newAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
    };
};
