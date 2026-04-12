import { type DbClient } from '@sentinel/db';

export type GetExamQuestionsDataArgs = {
    dbClient: DbClient;
    examId: string;
};

export async function getExamQuestionsData({ dbClient, examId }: GetExamQuestionsDataArgs) {
    return await dbClient
        .selectFrom('exam_questions as eq')
        .leftJoin(
            'question_bank_questions as qbq',
            'qbq.question_bank_question_id',
            'eq.source_question_bank_question_id',
        )
        .select([
            'eq.question_id',
            'eq.exam_id',
            'eq.exam_section_id',
            'eq.source_question_bank_question_id',
            'eq.source_collection_id',
            'eq.question_type',
            'eq.content',
            'eq.points',
            'eq.order_index',
            'eq.created_at',
            'eq.updated_at',
            'qbq.source_origin as source_origin',
            'qbq.source_file_name as source_file_name',
            'qbq.source_page_number as source_page_number',
            'qbq.source_evidence as source_evidence',
        ])
        .where('eq.exam_id', '=', examId)
        .orderBy('order_index', 'asc')
        .execute();
}
