import { type DbClient, type exam_status, type question_type } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetExamsQuery } from '../exam.dto';
import {
    buildStudentAttemptSelects,
    withStudentAttemptJoin,
} from '../../history/data/build-student-attempt-selects';
import { buildStaffExamVisibilityPredicates } from '../../assign/services/exam-access.service';
import type { RawExamRecord } from '../services/map-exam-response.service';
import {
    buildClassroomExamFilter,
    buildPublishedStudentExamPredicate,
    buildStudentExamVisibilityPredicate,
} from './build-student-exam-scope-predicates';
import {
    buildExamAssignmentSelects,
    withExamAssignmentsLateralJoin,
} from './build-exam-assignment-lateral-join';

/**
 * Escapes characters with special meaning in SQL ILIKE patterns (\, %, _).
 */
export function escapeIlikeWildcards(pattern: string): string {
    return pattern.replace(/[\\%_]/g, '\\$&');
}

export type GetExamsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetExamsQuery;
    studentUserId?: string;
    instructorUserId?: string;
    departmentId?: string;
};

/**
 * Fetches exam records for the current caller with role-aware visibility filters.
 */
export async function getExamsData({
    dbClient,
    institutionId,
    filters,
    studentUserId,
    instructorUserId,
    departmentId,
}: GetExamsDataArgs): Promise<RawExamRecord[] & { total: number }> {
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100);
    const page = Math.max(filters.page ?? 1, 1);
    const offset = (page - 1) * limit;

    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .leftJoin('exam_configurations as ec', 'ec.exam_id', 'e.exam_id')
        .leftJoin('user_profiles as up_creator', 'up_creator.user_id', 'e.created_by')
        .leftJoin('user_profiles as up_publisher', 'up_publisher.user_id', 'e.published_by')
        .leftJoin('rooms as r', 'r.room_id', 'e.room_id');

    query = withStudentAttemptJoin(query, studentUserId);
    query = withExamAssignmentsLateralJoin(query, 'e');

    query = query.select([
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
        'e.is_public',
        'e.created_by',
        sql<string | null>`trim(concat(up_creator.first_name, ' ', up_creator.last_name))`.as(
            'created_by_name',
        ),
        sql<
            string | null
        >`trim(concat(up_publisher.first_name, ' ', up_publisher.last_name))`.as(
            'published_by_name',
        ),
        'cg.class_name',
        's.subject_title',
        'ec.release_score_mode',
        (eb) =>
            eb
                .selectFrom('exam_questions as q')
                .select(sql<number>`count(*)::int`.as('count'))
                .whereRef('q.exam_id', '=', 'e.exam_id')
                .where('q.question_type', '=', sql<question_type>`'ESSAY'`)
                .as('essay_question_count'),
        'e.exam_category',
        'e.room_id',
        sql<string | null>`r.room_name`.as('room_name'),
        'e.section_id',
        'e.section_name',
        ...buildExamAssignmentSelects(),
        studentUserId
            ? sql<number | null>`null`.as('students_count')
            : (eb) =>
                eb
                    .selectFrom('exam_attempts as ea')
                    .select(sql<number>`count(distinct ea.student_id)::int`.as('count'))
                    .whereRef('ea.exam_id', '=', 'e.exam_id')
                    .as('students_count'),
        studentUserId
            ? sql<number | null>`null`.as('incident_count')
            : (eb) =>
                eb
                    .selectFrom('flagged_incidents as fi')
                    .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
                    .select(sql<number>`count(*)::int`.as('count'))
                    .whereRef('ea.exam_id', '=', 'e.exam_id')
                    .as('incident_count'),
        sql<string | null>`null`.as('linked_section_name'),
        ...buildStudentAttemptSelects(studentUserId),
        sql<number>`count(*) over()::int`.as('total_count'),
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
            }),
        );
    }

    if (filters.status) {
        const normalizedStatus = filters.status.toUpperCase().replace(/-/g, '_') as exam_status;
        query = query.where('e.status', '=', normalizedStatus);
    }

    if (filters.search) {
        const sanitizedSearch = `%${escapeIlikeWildcards(filters.search.trim())}%`;
        query = query.where((eb) =>
            eb.or([
                eb('e.title', 'ilike', sanitizedSearch),
                eb('e.description', 'ilike', sanitizedSearch),
                eb('cg.class_name', 'ilike', sanitizedSearch),
                eb('s.subject_title', 'ilike', sanitizedSearch),
            ]),
        );
    }

    if (studentUserId) {
        query = query.where((eb) =>
            eb.and([
                buildPublishedStudentExamPredicate({ examAlias: 'e' }),
                buildStudentExamVisibilityPredicate({
                    studentUserId,
                }),
            ]),
        );
    }

    if (instructorUserId) {
        if (!institutionId) {
            throw new Error('Institution context required for instructor exam visibility');
        }

        const visibilityPredicates = await buildStaffExamVisibilityPredicates({
            dbClient,
            userId: instructorUserId,
            institutionId,
            includePublicInstitutionExams: true,
        });

        if (visibilityPredicates.length > 0) {
            query = query.where(sql<boolean>`(${sql.join(visibilityPredicates, sql` or `)})`);
        } else {
            query = query.where(sql<boolean>`false`);
        }
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
                        .selectFrom('exam_section_assignments as esa_dept')
                        .innerJoin('sections as sec_esa', 'sec_esa.section_id', 'esa_dept.section_id')
                        .select('esa_dept.id')
                        .whereRef('esa_dept.exam_id', '=', 'e.exam_id')
                        .where('sec_esa.department_id', '=', departmentId),
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

    const rows = (await query
        .orderBy('e.updated_at', 'desc')
        .orderBy('e.exam_id', 'desc')
        .limit(limit)
        .offset(offset)
        .execute()) as RawExamRecord[];

    const total = Number(rows[0]?.total_count ?? 0);
    return Object.assign(rows, { total });
}
