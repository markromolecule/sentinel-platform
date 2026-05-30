import { type DbClient, executeTransaction } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { NotificationService } from '../../../general/notification/notification.service';
import { LogsService } from '../../../general/logs/logs.service';
import { getAccessibleClassroomOrThrow } from './classroom-access-query.service';

type ClassroomInstructorRecord = {
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

function buildClassroomNotificationLabel(classroom: {
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

async function getInstructorRoleId(dbClient: DbClient) {
    const role = await dbClient
        .selectFrom('roles')
        .select('role_id')
        .where('role_name', '=', 'instructor')
        .executeTakeFirst();

    if (!role) {
        throw new HTTPException(500, {
            message: 'Instructor role is not configured.',
        });
    }

    return role.role_id;
}

async function getClassroomInstructorAssignment(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
}) {
    const { dbClient, classGroupId, instructorUserId } = args;

    return await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select(['assignment_id', 'is_head'])
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .executeTakeFirst();
}

async function getAssignableInstructor(args: {
    dbClient: DbClient;
    instructorUserId: string;
    institutionId: string;
}) {
    const { dbClient, instructorUserId, institutionId } = args;

    return await dbClient
        .selectFrom('instructors as ins')
        .innerJoin('user_roles as ur', 'ur.user_id', 'ins.user_id')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
        .select([
            'ins.user_id as user_id',
            sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
        ])
        .where('ins.user_id', '=', instructorUserId)
        .where('ins.institution_id', '=', institutionId)
        .where('r.role_name', '=', 'instructor')
        .executeTakeFirst();
}

async function assertHeadInstructorClassroomAccess(args: {
    dbClient: DbClient;
    classGroupId: string;
    userId: string;
    institutionId: string;
}) {
    const { dbClient, classGroupId, userId, institutionId } = args;

    await getAccessibleClassroomOrThrow(dbClient, {
        classGroupId,
        userId,
        institutionId,
    });

    const assignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select(['assignment_id'])
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', userId)
        .where('is_head', '=', true)
        .executeTakeFirst();

    if (!assignment) {
        throw new HTTPException(403, {
            message: 'Only the head instructor can manage classroom instructors.',
        });
    }
}

export async function listClassroomInstructors(args: {
    dbClient: DbClient;
    classGroupId: string;
    userId: string;
    institutionId: string;
}) {
    const { dbClient, classGroupId, userId, institutionId } = args;

    await getAccessibleClassroomOrThrow(dbClient, {
        classGroupId,
        userId,
        institutionId,
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
                            sql<string>`'ACTIVE'`.as('status'),
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
            sql<string>`max(all_cia.status)`.as('status'),
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

export async function ensureClassroomHeadInstructorAssignment(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
}) {
    const { dbClient, classGroupId, instructorUserId } = args;
    const instructorRoleId = await getInstructorRoleId(dbClient);

    await executeTransaction(async (trx) => {
        const existingRole = await trx
            .selectFrom('class_roles')
            .select('class_group_id')
            .where('class_group_id', '=', classGroupId)
            .where('user_id', '=', instructorUserId)
            .where('role_id', '=', instructorRoleId)
            .executeTakeFirst();

        if (!existingRole) {
            await trx
                .insertInto('class_roles')
                .values({
                    class_group_id: classGroupId,
                    user_id: instructorUserId,
                    role_id: instructorRoleId,
                    assigned_at: new Date(),
                })
                .execute();
        }

        await trx
            .updateTable('classroom_instructor_assignments')
            .set({
                is_head: false,
                updated_at: new Date(),
            })
            .where('class_group_id', '=', classGroupId)
            .execute();

        await trx
            .insertInto('classroom_instructor_assignments')
            .values({
                class_group_id: classGroupId,
                instructor_user_id: instructorUserId,
                assigned_by_user_id: instructorUserId,
                is_head: true,
                status: 'ACTIVE',
                updated_at: new Date(),
            })
            .onConflict((oc) =>
                oc.columns(['class_group_id', 'instructor_user_id']).doUpdateSet({
                    assigned_by_user_id: instructorUserId,
                    is_head: true,
                    status: 'ACTIVE',
                    updated_at: new Date(),
                }),
            )
            .execute();
    });
}

export async function assignInstructorToClassroom(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
    actorUserId: string;
    institutionId: string;
}) {
    const { dbClient, classGroupId, instructorUserId, actorUserId, institutionId } = args;
    const instructorRoleId = await getInstructorRoleId(dbClient);

    await assertHeadInstructorClassroomAccess({
        dbClient,
        classGroupId,
        userId: actorUserId,
        institutionId,
    });

    const classroom = await getAccessibleClassroomOrThrow(dbClient, {
        classGroupId,
        userId: actorUserId,
        institutionId,
    });

    const instructor = await getAssignableInstructor({
        dbClient,
        instructorUserId,
        institutionId,
    });

    if (!instructor) {
        throw new HTTPException(404, {
            message: 'Instructor not found in the same institution.',
        });
    }

    const existingAssignment = await getClassroomInstructorAssignment({
        dbClient,
        classGroupId,
        instructorUserId,
    });

    if (existingAssignment) {
        throw new HTTPException(409, {
            message: 'Instructor is already assigned to this classroom.',
        });
    }

    const qualificationMode = await getQualificationMode(dbClient);
    const qualCheck = await checkInstructorQualification({
        dbClient,
        instructorUserId,
        subjectId: classroom.subject_id as string,
    });

    let statusToSet: 'ACTIVE' | 'PENDING_ACK' | 'FLAGGED' = 'PENDING_ACK';
    let flagReason: string | null = null;

    if (!qualCheck.isQualified) {
        if (qualificationMode === 'BLOCK') {
            throw new HTTPException(422, {
                message: `Instructor is not qualified for subject ${classroom.subject_code || ''} (Mode: BLOCK)`,
            });
        } else if (qualificationMode === 'WARN') {
            statusToSet = 'FLAGGED';
            flagReason = `Instructor is not qualified for subject: ${classroom.subject_code || 'Unknown'}`;
        }
    } else if (instructorUserId === actorUserId) {
        statusToSet = 'ACTIVE';
    }

    await executeTransaction(async (trx) => {
        const existingRole = await trx
            .selectFrom('class_roles')
            .select('class_group_id')
            .where('class_group_id', '=', classGroupId)
            .where('user_id', '=', instructorUserId)
            .where('role_id', '=', instructorRoleId)
            .executeTakeFirst();

        if (!existingRole) {
            await trx
                .insertInto('class_roles')
                .values({
                    class_group_id: classGroupId,
                    user_id: instructorUserId,
                    role_id: instructorRoleId,
                    assigned_at: new Date(),
                })
                .execute();
        }

        await trx
            .insertInto('classroom_instructor_assignments')
            .values({
                class_group_id: classGroupId,
                instructor_user_id: instructorUserId,
                assigned_by_user_id: actorUserId,
                is_head: false,
                status: statusToSet,
                flag_reason: flagReason,
                updated_at: new Date(),
            })
            .execute();
    });

    await NotificationService.notifyClassroomInstructorAssigned({
        dbClient,
        recipientUserId: instructor.user_id as string,
        actorUserId,
        institutionId,
        classGroupId,
        classroomLabel: buildClassroomNotificationLabel(classroom),
        assignerName: classroom.updated_by_name ?? 'Head Instructor',
    });

    return await listClassroomInstructors({
        dbClient,
        classGroupId,
        userId: actorUserId,
        institutionId,
    });
}

export async function removeInstructorFromClassroom(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
    actorUserId: string;
    institutionId: string;
}) {
    const { dbClient, classGroupId, instructorUserId, actorUserId, institutionId } = args;
    const instructorRoleId = await getInstructorRoleId(dbClient);

    await assertHeadInstructorClassroomAccess({
        dbClient,
        classGroupId,
        userId: actorUserId,
        institutionId,
    });

    const existingAssignment = await getClassroomInstructorAssignment({
        dbClient,
        classGroupId,
        instructorUserId,
    });

    if (!existingAssignment) {
        throw new HTTPException(404, {
            message: 'Instructor assignment not found for this classroom.',
        });
    }

    if (existingAssignment.is_head) {
        throw new HTTPException(409, {
            message: 'The head instructor cannot be removed from the classroom.',
        });
    }

    await executeTransaction(async (trx) => {
        await trx
            .deleteFrom('classroom_instructor_assignments')
            .where('class_group_id', '=', classGroupId)
            .where('instructor_user_id', '=', instructorUserId)
            .execute();

        await trx
            .deleteFrom('class_roles')
            .where('class_group_id', '=', classGroupId)
            .where('user_id', '=', instructorUserId)
            .where('role_id', '=', instructorRoleId)
            .execute();
    });
}

/**
 * Checks if an instructor is qualified for a subject (either explicitly or derived).
 */
export async function checkInstructorQualification(args: {
    dbClient: DbClient;
    instructorUserId: string;
    subjectId: string;
}) {
    const { dbClient, instructorUserId, subjectId } = args;

    const instructorRec = await dbClient
        .selectFrom('instructors')
        .select('instructor_id')
        .where('user_id', '=', instructorUserId)
        .executeTakeFirst();

    if (!instructorRec) {
        return { isQualified: false, reason: 'Instructor profile not found.' };
    }

    const instructorId = instructorRec.instructor_id;

    // Check explicit qualification
    const explicitQual = await dbClient
        .selectFrom('instructor_subjects')
        .select('instructor_subject_id')
        .where('instructor_id', '=', instructorId)
        .where('subject_id', '=', subjectId)
        .executeTakeFirst();

    if (explicitQual) {
        return { isQualified: true, type: 'explicit' };
    }

    // Check derived qualification
    const derivedQual = await dbClient
        .selectFrom('instructor_courses as ic')
        .innerJoin('course_subjects as cs', 'cs.course_id', 'ic.course_id')
        .select('cs.subject_id')
        .where('ic.instructor_id', '=', instructorId)
        .where('cs.subject_id', '=', subjectId)
        .executeTakeFirst();

    if (derivedQual) {
        return { isQualified: true, type: 'derived' };
    }

    return {
        isQualified: false,
        reason: 'Instructor does not have explicit or derived qualification for this subject.',
    };
}

/**
 * Gets the current system qualification mismatch handling mode from settings.
 */
async function getQualificationMode(dbClient: DbClient): Promise<'BLOCK' | 'WARN' | 'ALLOW'> {
    const setting = await dbClient
        .selectFrom('system_settings')
        .select('setting_value')
        .where('setting_key', '=', 'classroom_assignment_qualification_mode')
        .executeTakeFirst();

    if (!setting || !setting.setting_value) {
        return 'WARN';
    }

    const val = typeof setting.setting_value === 'string'
        ? setting.setting_value
        : (setting.setting_value as any).mode || 'WARN';

    return val.toUpperCase() as 'BLOCK' | 'WARN' | 'ALLOW';
}

/**
 * Acknowledges a classroom instructor assignment.
 */
export async function acknowledgeClassroomAssignment(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
    justification?: string;
}) {
    const { dbClient, classGroupId, instructorUserId, justification } = args;

    const assignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select(['assignment_id', 'status'])
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .executeTakeFirst();

    if (!assignment) {
        throw new HTTPException(404, {
            message: 'Classroom instructor assignment not found.',
        });
    }

    // Fetch classroom context and head instructor for notification routing
    const classroom = await dbClient
        .selectFrom('class_groups as cg')
        .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .select([
            'cg.institution_id',
            'cg.class_name',
            's.subject_title',
            'sec.section_name',
        ])
        .where('cg.class_group_id', '=', classGroupId)
        .executeTakeFirst();

    const headAssignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select('instructor_user_id')
        .where('class_group_id', '=', classGroupId)
        .where('is_head', '=', true)
        .executeTakeFirst();

    const instructorProfile = await dbClient
        .selectFrom('user_profiles')
        .select([sql<string>`trim(concat(first_name, ' ', last_name))`.as('name')])
        .where('user_id', '=', instructorUserId)
        .executeTakeFirst();

    await dbClient
        .updateTable('classroom_instructor_assignments')
        .set({
            status: 'ACKNOWLEDGED',
            responded_at: new Date(),
            justification: justification || null,
            updated_at: new Date(),
        })
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .execute();

    const institutionId = classroom?.institution_id ?? null;
    const classroomLabel = buildClassroomNotificationLabel({
        class_name: classroom?.class_name,
        subject_title: classroom?.subject_title,
        section_name: classroom?.section_name,
    });
    const instructorName = instructorProfile?.name ?? 'Instructor';

    // Notify the head instructor that the assignment was acknowledged
    if (headAssignment?.instructor_user_id && headAssignment.instructor_user_id !== instructorUserId) {
        try {
            await NotificationService.notifyClassroomAssignmentAcknowledged({
                dbClient,
                recipientUserId: headAssignment.instructor_user_id,
                actorUserId: instructorUserId,
                institutionId,
                classGroupId,
                classroomLabel,
                instructorName,
            });
        } catch (notifErr) {
            console.error('Failed to send acknowledgment notification:', notifErr);
        }
    }

    // Audit log the acknowledgment
    if (institutionId) {
        try {
            await LogsService.createLog(dbClient, {
                userId: instructorUserId,
                action: 'classroom_assignment.acknowledged',
                resourceType: 'classroom_instructor_assignment',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { classGroupId, instructorUserId, justification: justification ?? null },
            });
        } catch (logErr) {
            console.error('Failed to log classroom_assignment.acknowledged:', logErr);
        }
    }
}

/**
 * Flags a classroom instructor assignment (due to conflict, workload, etc).
 */
export async function flagClassroomAssignment(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
    flagReason: string;
    justification?: string;
}) {
    const { dbClient, classGroupId, instructorUserId, flagReason, justification } = args;

    const assignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select(['assignment_id', 'status'])
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .executeTakeFirst();

    if (!assignment) {
        throw new HTTPException(404, {
            message: 'Classroom instructor assignment not found.',
        });
    }

    // Fetch classroom context for notification and audit
    const classroom = await dbClient
        .selectFrom('class_groups as cg')
        .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .select([
            'cg.institution_id',
            'cg.class_name',
            's.subject_title',
            'sec.section_name',
        ])
        .where('cg.class_group_id', '=', classGroupId)
        .executeTakeFirst();

    const headAssignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select('instructor_user_id')
        .where('class_group_id', '=', classGroupId)
        .where('is_head', '=', true)
        .executeTakeFirst();

    const instructorProfile = await dbClient
        .selectFrom('user_profiles')
        .select([sql<string>`trim(concat(first_name, ' ', last_name))`.as('name')])
        .where('user_id', '=', instructorUserId)
        .executeTakeFirst();

    await dbClient
        .updateTable('classroom_instructor_assignments')
        .set({
            status: 'FLAGGED',
            responded_at: new Date(),
            flag_reason: flagReason,
            justification: justification || null,
            updated_at: new Date(),
        })
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .execute();

    const institutionId = classroom?.institution_id ?? null;
    const classroomLabel = buildClassroomNotificationLabel({
        class_name: classroom?.class_name,
        subject_title: classroom?.subject_title,
        section_name: classroom?.section_name,
    });
    const instructorName = instructorProfile?.name ?? 'Instructor';

    // Notify the head instructor that the assignment was flagged
    if (headAssignment?.instructor_user_id && headAssignment.instructor_user_id !== instructorUserId) {
        try {
            await NotificationService.notifyClassroomAssignmentFlagged({
                dbClient,
                recipientUserId: headAssignment.instructor_user_id,
                actorUserId: instructorUserId,
                institutionId,
                classGroupId,
                classroomLabel,
                instructorName,
                flagReason,
            });
        } catch (notifErr) {
            console.error('Failed to send flag notification:', notifErr);
        }
    }

    // Audit log the flag action
    if (institutionId) {
        try {
            await LogsService.createLog(dbClient, {
                userId: instructorUserId,
                action: 'classroom_assignment.flagged',
                resourceType: 'classroom_instructor_assignment',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: {
                    classGroupId,
                    instructorUserId,
                    flagReason,
                    justification: justification ?? null,
                },
            });
        } catch (logErr) {
            console.error('Failed to log classroom_assignment.flagged:', logErr);
        }
    }
}
