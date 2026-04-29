import { type DbClient } from '@sentinel/db';

export const getLobbyCount = async (dbClient: DbClient, examId: string) => {
    const row = await dbClient
        .selectFrom('exam_lobby_admissions as ela')
        .leftJoin('exam_attempts as ea', (join) =>
            join
                .onRef('ea.exam_id', '=', 'ela.exam_id')
                .onRef('ea.student_id', '=', 'ela.student_id')
                .on('ea.status', '=', 'IN_PROGRESS'),
        )
        .select((eb) => eb.fn.count('ela.admission_id').as('count'))
        .where('ela.exam_id', '=', examId)
        .where('ela.status', 'in', ['WAITING', 'APPROVED'])
        .where('ea.attempt_id', 'is', null)
        .executeTakeFirst();

    return {
        count: Number(row?.count ?? 0),
    };
};
