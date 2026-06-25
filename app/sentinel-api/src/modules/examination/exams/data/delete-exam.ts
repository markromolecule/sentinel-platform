import { type DbClient } from '@sentinel/db';

export type DeleteExamDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export type DeleteExamDataResponse = {
    exam_id: string;
    room_id: string | null;
};

export async function deleteExamData({ dbClient, id, institutionId }: DeleteExamDataArgs) {
    let query = dbClient
        .deleteFrom('exams')
        .where('exam_id', '=', id)
        .returning(['exam_id', 'room_id']);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return (await query.executeTakeFirst()) as DeleteExamDataResponse | undefined;
}
