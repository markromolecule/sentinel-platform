import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

type BaseStudentEnrollmentDetailArgs = {
    dbClient: DbClient;
    targetUserId: string;
    institutionId?: string;
    requesterUserId?: string;
};

type InstructorStudentEnrollmentDetailRecord = {
    enrollment_id: string;
    subject_name: string | null;
    classroom_name: string | null;
    section_name: string | null;
    term_name: string | null;
    year_level: number | null;
};

function formatYearLevel(yearLevel?: number | null) {
    if (!yearLevel) {
        return null;
    }

    switch (yearLevel) {
        case 1:
            return '1st Year';
        case 2:
            return '2nd Year';
        case 3:
            return '3rd Year';
        default:
            return `${yearLevel}th Year`;
    }
}

async function getStudentEnrollmentDetailData({
    dbClient,
    targetUserId,
    institutionId,
    requesterUserId,
}: BaseStudentEnrollmentDetailArgs) {
    let query = dbClient
        .selectFrom('enrollments as e')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .innerJoin('students as s', 's.student_id', 'e.student_id')
        .innerJoin('user_profiles as up', 'up.user_id', 's.user_id')
        .leftJoin('subjects as sub', 'sub.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .leftJoin('terms as t', 't.term_id', 'cg.term_id')
        .select([
            'e.enrollment_id',
            'sub.subject_title as subject_name',
            'cg.class_name as classroom_name',
            'sec.section_name as section_name',
            sql<string | null>`CONCAT(t.academic_year, ' - ', t.semester)`.as('term_name'),
            'sec.year_level',
        ])
        .where('cg.archived_at', 'is', null)
        .where('up.user_id', '=', targetUserId);

    if (requesterUserId) {
        query = query
            .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
            .innerJoin('roles as role_scope', 'role_scope.role_id', 'cr.role_id')
            .where('cr.user_id', '=', requesterUserId)
            .where('role_scope.role_name', '=', 'instructor');
    }

    if (institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    const records = (await query
        .orderBy('sub.subject_title', 'asc')
        .orderBy('sec.section_name', 'asc')
        .execute()) as InstructorStudentEnrollmentDetailRecord[];

    return records.map((record) => ({
        id: record.enrollment_id,
        subject: record.subject_name ?? '—',
        classroom: record.classroom_name?.trim() || 'Unconfigured classroom',
        section: record.section_name ?? '—',
        term: record.term_name ?? '—',
        yearLevel: formatYearLevel(record.year_level),
    }));
}

export async function getInstructorStudentEnrollmentDetailData({
    dbClient,
    requesterUserId,
    targetUserId,
    institutionId,
}: BaseStudentEnrollmentDetailArgs & { requesterUserId: string }) {
    return getStudentEnrollmentDetailData({
        dbClient,
        requesterUserId,
        targetUserId,
        institutionId,
    });
}

export async function getStudentEnrollmentDetailDataForAdmin({
    dbClient,
    targetUserId,
    institutionId,
}: BaseStudentEnrollmentDetailArgs) {
    return getStudentEnrollmentDetailData({
        dbClient,
        targetUserId,
        institutionId,
    });
}
