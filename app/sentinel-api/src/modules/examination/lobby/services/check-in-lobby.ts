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
    if (mode === 'AUTOMATIC') {
        return {
            status: 'APPROVED' as const,
            checkedInAt: new Date().toISOString(),
        };
    }

    const existingAdmission = await dbClient
        .selectFrom('exam_lobby_admissions')
        .selectAll()
        .where('exam_id', '=', examId)
        .where('student_id', '=', studentId)
        .executeTakeFirst();

    if (existingAdmission) {
        return {
            status: existingAdmission.status,
            checkedInAt: existingAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
        };
    }

    const newAdmission = await dbClient
        .insertInto('exam_lobby_admissions')
        .values({
            exam_id: examId,
            student_id: studentId,
            status: 'WAITING',
            checked_in_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return {
        status: newAdmission.status,
        checkedInAt: newAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
    };
};
