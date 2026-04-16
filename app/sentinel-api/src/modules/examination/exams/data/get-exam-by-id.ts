import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { getExamColumnSupport } from '../helper/exam-schema-compat';
import type { RawExamRecord } from '../services/map-exam-response';

export type GetExamByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function getExamByIdData({ dbClient, id, institutionId }: GetExamByIdDataArgs) {
    const columnSupport = await getExamColumnSupport(dbClient);

    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id');

    if (columnSupport.hasRoomId) {
        query = query.leftJoin('rooms as r', 'r.room_id', 'e.room_id');
    }

    query = query
        .select([
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
            'e.institution_id',
            's.subject_title',
            columnSupport.hasRoomId ? 'e.room_id' : sql<string | null>`null`.as('room_id'),
            columnSupport.hasRoomId
                ? sql<string | null>`r.room_name`.as('room_name')
                : sql<string | null>`null`.as('room_name'),
            columnSupport.hasSectionId ? 'e.section_id' : sql<string | null>`null`.as('section_id'),
            columnSupport.hasSectionName
                ? 'e.section_name'
                : sql<string | null>`null`.as('section_name'),
            sql<string | null>`null`.as('linked_section_name'),
        ])
        .where('e.exam_id', '=', id);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    return (await query.executeTakeFirst()) as RawExamRecord | undefined;
}
