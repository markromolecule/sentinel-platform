import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import type { ExamHistoryDetail } from '../history.dto';
import { getExamColumnSupport } from '../../exams/helper/exam-schema-compat';
import {
    mapExamHistoryDetailResponse,
    type RawExamRecord,
} from '../../exams/services/map-exam-response';

export async function getStudentExamHistoryDetail(
    dbClient: DbClient,
    attemptId: string,
    studentUserId: string,
    institutionId?: string,
): Promise<ExamHistoryDetail> {
    const columnSupport = await getExamColumnSupport(dbClient);

    let query = dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('students as st', 'st.student_id', 'ea.student_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id');

    if (columnSupport.hasRoomId) {
        query = query.leftJoin('rooms as r', 'r.room_id', 'e.room_id');
    }

    const record = (await query
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
            'ea.attempt_id as attempt_id',
            sql<string | null>`ea.status::text`.as('attempt_status'),
            'ea.completed_at as attempt_completed_at',
            'ea.score as attempt_score',
            'ea.total_score as attempt_total_score',
            'ea.time_spent_minutes as attempt_time_spent_minutes',
            sql<number>`coalesce((
                select count(*)::int
                from flagged_incidents as fi
                where fi.attempt_id = ea.attempt_id
            ), 0)`.as('attempt_incident_count'),
            sql<string | null>`(
                select fi.incident_type::text
                from flagged_incidents as fi
                where fi.attempt_id = ea.attempt_id
                order by fi.timestamp desc nulls last
                limit 1
            )`.as('attempt_primary_incident_type'),
        ])
        .where('ea.attempt_id', '=', attemptId)
        .where('st.user_id', '=', studentUserId)
        .where('e.published_at', 'is not', null)
        .$if(Boolean(institutionId), (qb) => qb.where('e.institution_id', '=', institutionId!))
        .executeTakeFirst()) as RawExamRecord | undefined;

    if (!record) {
        throw new HTTPException(404, {
            message: 'Exam history record not found.',
        });
    }

    return mapExamHistoryDetailResponse(record);
}
