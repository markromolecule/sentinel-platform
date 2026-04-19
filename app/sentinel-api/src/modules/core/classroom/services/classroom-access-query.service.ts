import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { HTTPException } from 'hono/http-exception';
import {
    getClassGroupColumnSupport,
    getClassroomExamColumnSupport,
} from '../helper/classroom-schema-compat';
import {
    type ClassroomAccessScope,
    type ClassroomScope,
    type RawClassroomRecord,
} from '../helper/classroom.types';

export async function buildAccessibleClassroomsQuery(
    dbClient: DbClient,
    { userId, institutionId }: ClassroomScope,
) {
    const [examColumnSupport, classGroupColumnSupport] = await Promise.all([
        getClassroomExamColumnSupport(dbClient),
        getClassGroupColumnSupport(dbClient),
    ]);

    const examCountSelect = examColumnSupport.hasClassGroupId
        ? sql<number>`(
              select count(*)::int
              from exams as ex
              where ex.class_group_id = cg.class_group_id
          )`
        : examColumnSupport.hasSectionId
          ? sql<number>`(
                select count(*)::int
                from exams as ex
                where ex.subject_id = cg.subject_id
                  and ex.section_id is not distinct from cg.section_id
                  and ex.institution_id is not distinct from cg.institution_id
            )`
          : sql<number>`0`;

    let query = dbClient
        .selectFrom('class_groups as cg')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .leftJoin('terms as t', 't.term_id', 'cg.term_id')
        .leftJoin('departments as dep', 'dep.department_id', 'sec.department_id')
        .leftJoin('courses as course', 'course.course_id', 'sec.course_id')
        .leftJoin('enrollments as enr', 'enr.class_group_id', 'cg.class_group_id')
        .$if(classGroupColumnSupport.hasUpdatedBy, (qb) =>
            qb.leftJoin(
                'user_profiles as updater_profile',
                'updater_profile.user_id',
                'cg.updated_by',
            ),
        )
        .where('cr.user_id', '=', userId)
        .where('r.role_name', '=', 'instructor')
        .where('cg.institution_id', '=', institutionId);

    query = query.select([
        'cg.class_group_id',
        classGroupColumnSupport.hasClassName
            ? 'cg.class_name'
            : sql<string | null>`null`.as('class_name'),
        'cg.subject_offering_id',
        'cg.subject_id',
        's.subject_code',
        's.subject_title',
        'cg.section_id',
        'sec.section_name',
        'cg.term_id',
        't.academic_year as term_academic_year',
        't.semester as term_semester',
        'sec.department_id',
        'dep.department_code as department_code',
        'dep.department_name as department_name',
        'sec.course_id',
        'course.code as course_code',
        'course.title as course_title',
        'sec.year_level',
        'cg.institution_id',
        'cg.created_at',
        classGroupColumnSupport.hasUpdatedAt
            ? 'cg.updated_at'
            : sql<string | Date | null>`null`.as('updated_at'),
        classGroupColumnSupport.hasUpdatedBy
            ? 'cg.updated_by'
            : sql<string | null>`null`.as('updated_by'),
        sql<number>`CAST(COUNT(DISTINCT enr.enrollment_id) AS INTEGER)`.as('student_count'),
        examCountSelect.as('exam_count'),
        classGroupColumnSupport.hasUpdatedBy
            ? sql<
                  string | null
              >`MAX(NULLIF(TRIM(CONCAT_WS(' ', updater_profile.first_name, updater_profile.last_name)), ''))`.as(
                  'updated_by_name',
              )
            : sql<string | null>`null`.as('updated_by_name'),
    ]);

    query = query.groupBy([
        'cg.class_group_id',
        'cg.subject_offering_id',
        'cg.subject_id',
        's.subject_code',
        's.subject_title',
        'cg.section_id',
        'sec.section_name',
        'cg.term_id',
        't.academic_year',
        't.semester',
        'sec.department_id',
        'dep.department_code',
        'dep.department_name',
        'sec.course_id',
        'course.code',
        'course.title',
        'sec.year_level',
        'cg.institution_id',
        'cg.created_at',
    ]);

    if (classGroupColumnSupport.hasClassName) {
        query = query.groupBy('cg.class_name');
    }

    if (classGroupColumnSupport.hasUpdatedAt) {
        query = query.groupBy('cg.updated_at');
    }

    if (classGroupColumnSupport.hasUpdatedBy) {
        query = query.groupBy('cg.updated_by');
    }

    return query;
}

export async function getAccessibleClassroomOrThrow(
    dbClient: DbClient,
    { classGroupId, userId, institutionId }: ClassroomAccessScope,
): Promise<RawClassroomRecord> {
    const classroom = (await buildAccessibleClassroomsQuery(dbClient, { userId, institutionId }))
        .where('cg.class_group_id', '=', classGroupId)
        .executeTakeFirst() as Promise<RawClassroomRecord | undefined>;

    const resolvedClassroom = await classroom;

    if (!resolvedClassroom) {
        throw new HTTPException(404, { message: 'Classroom not found.' });
    }

    return resolvedClassroom;
}
