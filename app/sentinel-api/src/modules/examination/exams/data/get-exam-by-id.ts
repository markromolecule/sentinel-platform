import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import {
    buildStudentAttemptSelects,
    withStudentAttemptJoin,
} from '../../history/data/build-student-attempt-selects';
import type { RawExamRecord } from '../services/map-exam-response.service';
import { buildStaffExamVisibilityPredicates } from '../../assign/services/exam-access.service';
import {
    buildPublishedStudentExamPredicate,
    buildStudentExamVisibilityPredicate,
} from './build-student-exam-scope-predicates';
import {
    buildExamAssignmentSelects,
    withExamAssignmentsLateralJoin,
} from './build-exam-assignment-lateral-join';

export type GetExamByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    studentUserId?: string;
    staffUserId?: string;
    applyStaffVisibility?: boolean;
};

export async function getExamByIdData({
    dbClient,
    id,
    institutionId,
    studentUserId,
    staffUserId,
    applyStaffVisibility,
}: GetExamByIdDataArgs): Promise<RawExamRecord | undefined> {
    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
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
        'e.institution_id',
        'e.created_by',
        'cg.class_name',
        's.subject_title',
        'e.room_id',
        sql<string | null>`r.room_name`.as('room_name'),
        'e.section_id',
        'e.section_name',
        ...buildExamAssignmentSelects(),
        sql<string | null>`null`.as('linked_section_name'),
        ...buildStudentAttemptSelects(studentUserId),
    ])
        .where('e.exam_id', '=', id);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
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

    if (applyStaffVisibility && staffUserId) {
        const visibilityPredicates = await buildStaffExamVisibilityPredicates({
            dbClient,
            userId: staffUserId,
            institutionId,
            includePublicInstitutionExams: true,
        });

        if (visibilityPredicates.length > 0) {
            query = query.where((eb) => eb.or(visibilityPredicates));
        } else {
            query = query.where(sql<boolean>`false`);
        }
    }

    return (await query.executeTakeFirst()) as RawExamRecord | undefined;
}
