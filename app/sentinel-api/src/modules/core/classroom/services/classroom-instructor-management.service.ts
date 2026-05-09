import { type DbClient, executeTransaction } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { NotificationService } from '../../../general/notification/notification.service';
import { getAccessibleClassroomOrThrow } from './classroom-access-query.service';

type ClassroomInstructorRecord = {
    user_id: string;
    name: string;
    is_head: boolean;
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
        .selectFrom('classroom_instructor_assignments as cia')
        .innerJoin('user_profiles as up', 'up.user_id', 'cia.instructor_user_id')
        .leftJoin(
            'user_profiles as assigner_profile',
            'assigner_profile.user_id',
            'cia.assigned_by_user_id',
        )
        .select([
            'cia.instructor_user_id as user_id',
            sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
            'cia.is_head',
            'cia.created_at as assigned_at',
            'cia.assigned_by_user_id',
            sql<
                string | null
            >`nullif(trim(concat(assigner_profile.first_name, ' ', assigner_profile.last_name)), '')`.as(
                'assigned_by_name',
            ),
        ])
        .where('cia.class_group_id', '=', classGroupId)
        .orderBy('cia.is_head', 'desc')
        .orderBy('name', 'asc')
        .execute();

    return instructors.map((instructor: ClassroomInstructorRecord) => ({
        ...instructor,
        assigned_at: instructor.assigned_at ? new Date(instructor.assigned_at).toISOString() : null,
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
                updated_at: new Date(),
            })
            .onConflict((oc) =>
                oc.columns(['class_group_id', 'instructor_user_id']).doUpdateSet({
                    assigned_by_user_id: instructorUserId,
                    is_head: true,
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
