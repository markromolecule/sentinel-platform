import { type DbClient } from '@sentinel/db';
import { getAccessibleClassroomOrThrow } from './classroom-access-query.service';
import { sql } from 'kysely';

export type ClassroomInstructorRecord = {
    user_id: string;
    name: string;
    is_head: boolean;
    status: 'ACTIVE' | 'PENDING_ACK' | 'ACKNOWLEDGED' | 'FLAGGED' | 'REMOVED';
    responded_at: string | Date | null;
    justification: string | null;
    flag_reason: string | null;
    assigned_at: string | Date | null;
    assigned_by_user_id: string | null;
    assigned_by_name: string | null;
};

/**
 * Builds a consistent and user-friendly classroom notification label.
 */
export function buildClassroomNotificationLabel(classroom: {
    class_name?: string | null;
    subject_title?: string | null;
    section_name?: string | null;
}) {
    if (classroom.class_name) {
        return classroom.class_name;
    }

    return (
        [classroom.subject_title, classroom.section_name].filter(Boolean).join(' - ') || 'Classroom'
    );
}

/**
 * Lists all instructors assigned to a classroom.
 */
export async function listClassroomInstructors(args: {
    dbClient: DbClient;
    classGroupId: string;
    userId: string;
    institutionId: string;
    userRole?: string;
}) {
    const { dbClient, classGroupId, userId, institutionId, userRole } = args;

    await getAccessibleClassroomOrThrow(dbClient, {
        classGroupId,
        userId,
        institutionId,
        userRole,
    });

    const instructors = await dbClient
        .selectFrom((eb) =>
            eb
                .selectFrom('classroom_instructor_assignments as cia')
                .select([
                    'cia.instructor_user_id as user_id',
                    'cia.is_head',
                    'cia.status',
                    'cia.responded_at',
                    'cia.justification',
                    'cia.flag_reason',
                    'cia.created_at as assigned_at',
                    'cia.assigned_by_user_id',
                ])
                .where('cia.class_group_id', '=', classGroupId)
                .unionAll((eb) =>
                    eb
                        .selectFrom('class_roles as cr')
                        .select([
                            'cr.user_id',
                            sql<boolean>`false`.as('is_head'),
                            sql<'ACTIVE'>`'ACTIVE'`.as('status'),
                            sql<Date | null>`null`.as('responded_at'),
                            sql<string | null>`null`.as('justification'),
                            sql<string | null>`null`.as('flag_reason'),
                            'cr.assigned_at',
                            sql<string | null>`null`.as('assigned_by_user_id'),
                        ])
                        .where('cr.class_group_id', '=', classGroupId)
                        .where(
                            'cr.role_id',
                            '=',
                            sql<number>`(select role_id from roles where role_name = 'instructor')`,
                        ),
                )
                .as('all_cia'),
        )
        .innerJoin('user_profiles as up', 'up.user_id', 'all_cia.user_id')
        .leftJoin(
            'user_profiles as assigner_profile',
            'assigner_profile.user_id',
            'all_cia.assigned_by_user_id',
        )
        .select([
            'all_cia.user_id',
            sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
            sql<boolean>`bool_or(all_cia.is_head)`.as('is_head'),
            sql<ClassroomInstructorRecord['status']>`max(all_cia.status)`.as('status'),
            sql<Date | null>`max(all_cia.responded_at)`.as('responded_at'),
            sql<string | null>`max(all_cia.justification)`.as('justification'),
            sql<string | null>`max(all_cia.flag_reason)`.as('flag_reason'),
            sql<string | Date | null>`max(all_cia.assigned_at)`.as('assigned_at'),
            sql<string | null>`max(all_cia.assigned_by_user_id::text)`.as('assigned_by_user_id'),
            sql<
                string | null
            >`max(nullif(trim(concat(assigner_profile.first_name, ' ', assigner_profile.last_name)), ''))`.as(
                'assigned_by_name',
            ),
        ])
        .groupBy(['all_cia.user_id', 'up.first_name', 'up.last_name'])
        .orderBy('is_head', 'desc')
        .orderBy('name', 'asc')
        .execute();

    return instructors.map((instructor: ClassroomInstructorRecord) => ({
        ...instructor,
        assigned_at: instructor.assigned_at ? new Date(instructor.assigned_at).toISOString() : null,
        responded_at: instructor.responded_at ? new Date(instructor.responded_at).toISOString() : null,
    }));
}
