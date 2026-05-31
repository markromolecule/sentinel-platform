import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { getAccessibleClassroomOrThrow } from './classroom-access-query.service';

/**
 * Gets the instructor role ID.
 */
export async function getInstructorRoleId(dbClient: DbClient) {
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

/**
 * Gets a specific classroom instructor assignment record.
 */
export async function getClassroomInstructorAssignment(args: {
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

/**
 * Gets details of an instructor that can be assigned.
 */
export async function getAssignableInstructor(args: {
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

/**
 * Asserts that the actor is the head instructor and has access to the classroom.
 */
export async function assertHeadInstructorClassroomAccess(args: {
    dbClient: DbClient;
    classGroupId: string;
    userId: string;
    institutionId: string;
    userRole?: string;
}) {
    const { dbClient, classGroupId, userId, institutionId, userRole } = args;

    const isCoreAdmin = userRole ? ['support', 'superadmin', 'admin'].includes(userRole) : false;
    if (isCoreAdmin) {
        return;
    }

    await getAccessibleClassroomOrThrow(dbClient, {
        classGroupId,
        userId,
        institutionId,
        userRole,
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
