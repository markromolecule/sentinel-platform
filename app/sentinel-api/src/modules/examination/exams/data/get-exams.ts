import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetExamsQuery } from '../exam.dto';
import { getExamColumnSupport } from '../helper/exam-schema-compat';
import type { RawExamRecord } from '../services/map-exam-response';

export type GetExamsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetExamsQuery;
};

export async function getExamsData({ dbClient, institutionId, filters }: GetExamsDataArgs) {
    const columnSupport = await getExamColumnSupport(dbClient);

    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id');

    if (columnSupport.hasRoomId) {
        query = query.leftJoin('rooms as r', 'r.room_id', 'e.room_id');
    }

    query = query.select([
        'e.exam_id',
        'e.title',
        'e.description',
        'e.duration_minutes',
        'e.passing_score',
        'e.status',
        'e.subject_id',
        'e.scheduled_date',
        'e.end_date_time',
        'e.published_at',
        'e.question_count',
        'e.created_at',
        'e.updated_at',
        's.subject_title',
        columnSupport.hasRoomId ? 'e.room_id' : sql<string | null>`null`.as('room_id'),
        columnSupport.hasRoomId ? 'r.room_name' : sql<string | null>`null`.as('room_name'),
        columnSupport.hasSectionId ? 'e.section_id' : sql<string | null>`null`.as('section_id'),
        columnSupport.hasSectionName
            ? 'e.section_name'
            : sql<string | null>`null`.as('section_name'),
        sql<string | null>`null`.as('linked_section_name'),
    ]);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    if (filters.subjectId) {
        query = query.where('e.subject_id', '=', filters.subjectId);
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

    return (await query.orderBy('e.updated_at', 'desc').execute()) as RawExamRecord[];
}
