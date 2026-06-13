import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetExamsQuery } from '../exam.dto';
import { buildStudentAttemptSelects } from '../../history/data/build-student-attempt-selects';
import { getExamColumnSupport } from '../helper/exam-schema-compat';
import type { RawExamRecord } from '../services/map-exam-response';
import {
    buildClassroomExamFilter,
    buildStudentExamVisibilityPredicate,
} from './build-student-exam-scope-predicates';

export type GetExamsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetExamsQuery;
    studentUserId?: string;
    departmentId?: string;
};

export async function getExamsData({
    dbClient,
    institutionId,
    filters,
    studentUserId,
    departmentId,
}: GetExamsDataArgs) {
    const columnSupport = await getExamColumnSupport(dbClient);

    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .$if(columnSupport.hasRoomId, (qb) => qb.leftJoin('rooms as r', 'r.room_id', 'e.room_id'))
        .select([
            'e.exam_id',
            'e.title',
            'e.description',
            'e.duration_minutes',
            'e.passing_score',
            'e.status',
            'e.class_group_id',
            'e.subject_id',
            'e.scheduled_date',
            'e.end_date_time',
            'e.published_at',
            'e.question_count',
            'e.created_at',
            'e.updated_at',
            'cg.class_name',
            's.subject_title',
            'e.exam_category',
            columnSupport.hasRoomId ? 'e.room_id' : sql<string | null>`null`.as('room_id'),
            columnSupport.hasRoomId
                ? sql<string | null>`r.room_name`.as('room_name')
                : sql<string | null>`null`.as('room_name'),
            columnSupport.hasSectionId ? 'e.section_id' : sql<string | null>`null`.as('section_id'),
            columnSupport.hasSectionName
                ? 'e.section_name'
                : sql<string | null>`null`.as('section_name'),
            (eb) =>
                eb
                    .selectFrom('exam_assigned_sections as eas')
                    .innerJoin('sections as s_inner', 's_inner.section_id', 'eas.section_id')
                    .select(
                        sql<string[]>`coalesce(json_agg(s_inner.section_name), '[]'::json)`.as(
                            'section_names',
                        ),
                    )
                    .whereRef('eas.exam_id', '=', 'e.exam_id')
                    .as('assigned_section_names'),
            (eb) =>
                eb
                    .selectFrom('exam_assigned_sections as eas')
                    .select(
                        sql<string[]>`coalesce(json_agg(eas.section_id), '[]'::json)`.as(
                            'section_ids',
                        ),
                    )
                    .whereRef('eas.exam_id', '=', 'e.exam_id')
                    .as('assigned_section_ids'),
            (eb) =>
                eb
                    .selectFrom('exam_attempts as ea')
                    .select(sql<number>`count(distinct ea.student_id)::int`.as('count'))
                    .whereRef('ea.exam_id', '=', 'e.exam_id')
                    .as('students_count'),
            (eb) =>
                eb
                    .selectFrom('flagged_incidents as fi')
                    .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
                    .select(sql<number>`count(*)::int`.as('count'))
                    .whereRef('ea.exam_id', '=', 'e.exam_id')
                    .as('incident_count'),
            sql<string | null>`null`.as('linked_section_name'),
            ...buildStudentAttemptSelects(studentUserId),
        ]);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    if (filters.subjectId) {
        query = query.where('e.subject_id', '=', filters.subjectId);
    }

    if (filters.classroomId) {
        query = query.where(
            buildClassroomExamFilter({
                classroomId: filters.classroomId,
                hasSectionId: columnSupport.hasSectionId,
            }),
        );
    }

    if (filters.search) {
        query = query.where((eb) =>
            eb.or([
                eb('e.title', 'ilike', `%${filters.search}%`),
                eb('e.description', 'ilike', `%${filters.search}%`),
                eb('cg.class_name', 'ilike', `%${filters.search}%`),
                eb('s.subject_title', 'ilike', `%${filters.search}%`),
            ]),
        );
    }

    if (studentUserId) {
        query = query.where('e.published_at', 'is not', null).where(
            buildStudentExamVisibilityPredicate({
                studentUserId,
                hasSectionId: columnSupport.hasSectionId,
            }),
        );
    }

    if (departmentId) {
        query = query.where((eb) =>
            eb.or([
                eb.exists(
                    eb
                        .selectFrom('sections as sec')
                        .select('sec.section_id')
                        .whereRef('sec.section_id', '=', 'e.section_id')
                        .where('sec.department_id', '=', departmentId),
                ),
                eb.exists(
                    eb
                        .selectFrom('sections as sec_cg')
                        .select('sec_cg.section_id')
                        .whereRef('sec_cg.section_id', '=', 'cg.section_id')
                        .where('sec_cg.department_id', '=', departmentId),
                ),
                eb.exists(
                    eb
                        .selectFrom('subject_departments as sd')
                        .select('sd.subject_id')
                        .whereRef('sd.subject_id', '=', 'e.subject_id')
                        .where('sd.department_id', '=', departmentId),
                ),
            ]),
        );
    }

    return (await query.orderBy('e.updated_at', 'desc').execute()) as RawExamRecord[];
}
