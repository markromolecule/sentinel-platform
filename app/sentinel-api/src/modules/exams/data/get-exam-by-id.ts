import { type DbClient } from '@sentinel/db';

export type GetExamByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function getExamByIdData({
    dbClient,
    id,
    institutionId,
}: GetExamByIdDataArgs) {
    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'e.section_id')
        .select([
            'e.exam_id',
            'e.title',
            'e.description',
            'e.duration_minutes',
            'e.passing_score',
            'e.status',
            'e.subject_id',
            'e.section_id',
            'e.section_name',
            'e.scheduled_date',
            'e.end_date_time',
            'e.published_at',
            'e.question_count',
            'e.created_at',
            'e.updated_at',
            'e.institution_id',
            's.subject_title',
            'sec.section_name as linked_section_name',
        ])
        .where('e.exam_id', '=', id);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
