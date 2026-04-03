import { type DbClient } from '@sentinel/db';
import type { GetExamsQuery } from '../exam.dto';

export type GetExamsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetExamsQuery;
};

export async function getExamsData({
    dbClient,
    institutionId,
    filters,
}: GetExamsDataArgs) {
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
            's.subject_title',
            'sec.section_name as linked_section_name',
        ]);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    if (filters.subjectId) {
        query = query.where('e.subject_id', '=', filters.subjectId);
    }

    if (filters.status) {
        query = query.where('e.status', '=', filters.status.toUpperCase().replace('-', '_') as any);
    }

    if (filters.search) {
        query = query.where((eb) =>
            eb.or([
                eb('e.title', 'ilike', `%${filters.search}%`),
                eb('e.description', 'ilike', `%${filters.search}%`),
                eb('s.subject_title', 'ilike', `%${filters.search}%`),
            ]),
        );
    }

    return await query.orderBy('e.updated_at', 'desc').execute();
}
