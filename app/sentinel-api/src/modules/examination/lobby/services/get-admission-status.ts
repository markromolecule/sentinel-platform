import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export const getAdmissionStatus = async (dbClient: DbClient, examId: string, studentId: string) => {
    const exam = await dbClient
        .selectFrom('exams as e')
        .leftJoin('exam_configurations as ec', 'e.exam_id', 'ec.exam_id')
        .select(['e.exam_id', 'ec.lobby_admission_mode'])
        .where('e.exam_id', '=', examId)
        .executeTakeFirst();

    if (!exam) {
        throw new HTTPException(404, { message: 'Exam not found' });
    }

    if ((exam.lobby_admission_mode ?? 'AUTOMATIC') === 'AUTOMATIC') {
        return {
            status: 'APPROVED' as const,
            checkedInAt: null,
            decidedAt: null,
        };
    }

    const admission = await dbClient
        .selectFrom('exam_lobby_admissions')
        .selectAll()
        .where('exam_id', '=', examId)
        .where('student_id', '=', studentId)
        .executeTakeFirst();

    if (!admission) {
        return {
            status: null,
            checkedInAt: null,
            decidedAt: null,
        };
    }

    return {
        status: admission.status,
        checkedInAt: admission.checked_in_at?.toISOString() ?? null,
        decidedAt: admission.decided_at?.toISOString() ?? null,
    };
};
