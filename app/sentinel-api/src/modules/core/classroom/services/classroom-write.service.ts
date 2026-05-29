import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    type ClassroomAccessScope,
    type ClassroomStudentAccessScope,
} from '../helper/classroom.types';
import { getClassGroupColumnSupport } from '../helper/classroom-schema-compat';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export async function saveClassroomConfiguration(args: {
    dbClient: DbClient;
    classGroupId: string;
    className: string;
    updatedBy: string;
}) {
    const { dbClient, classGroupId, className, updatedBy } = args;
    const classGroupColumnSupport = await getClassGroupColumnSupport(dbClient);

    if (!classGroupColumnSupport.hasClassName) {
        throw new HTTPException(503, {
            message:
                'Classroom storage is not available yet. Run the 20260419100000_add_classroom_foundation migration first.',
        });
    }

    const classroom = await dbClient
        .selectFrom('class_groups')
        .select(['institution_id', 'class_name'])
        .where('class_group_id', '=', classGroupId)
        .executeTakeFirst();

    await dbClient
        .updateTable('class_groups')
        .set({
            class_name: className.trim(),
            ...(classGroupColumnSupport.hasUpdatedAt
                ? { updated_at: new Date().toISOString() }
                : {}),
            ...(classGroupColumnSupport.hasUpdatedBy ? { updated_by: updatedBy } : {}),
        })
        .where('class_group_id', '=', classGroupId)
        .execute();

    if (classroom?.institution_id) {
        try {
            await ActivityNotificationService.notifyInstitutionActivityUpdated({
                dbClient,
                actorUserId: updatedBy,
                institutionId: classroom.institution_id,
                targetType: 'CLASSROOM',
                targetId: classGroupId,
                targetLabel: className.trim(),
                title: 'Classroom settings updated',
                message: `Classroom settings for "${classroom.class_name || 'Classroom'}" updated to "${className.trim()}".`,
                sourceModule: 'classrooms',
                sourceAction: 'configure',
            });
        } catch (notifErr) {
            console.error('Failed to notify saveClassroomConfiguration:', notifErr);
        }
    }
}

export async function deleteClassroom(
    dbClient: DbClient,
    { classGroupId, userId, institutionId }: ClassroomAccessScope,
) {
    const classroom = await dbClient
        .selectFrom('class_groups as cg')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .select(['cg.class_group_id', 'cg.class_name'])
        .where('cg.class_group_id', '=', classGroupId)
        .where('cr.user_id', '=', userId)
        .where('r.role_name', '=', 'instructor')
        .where('cg.institution_id', '=', institutionId)
        .executeTakeFirst();

    if (!classroom) {
        throw new HTTPException(404, { message: 'Classroom not found.' });
    }

    await dbClient.deleteFrom('class_groups').where('class_group_id', '=', classGroupId).execute();

    try {
        await ActivityNotificationService.notifyInstitutionActivityDeleted({
            dbClient,
            actorUserId: userId,
            institutionId,
            targetType: 'CLASSROOM',
            targetId: classGroupId,
            targetLabel: classroom.class_name || 'Classroom',
            title: 'Classroom deleted',
            message: `Classroom "${classroom.class_name || 'Classroom'}" has been deleted.`,
            sourceModule: 'classrooms',
            sourceAction: 'delete',
        });
    } catch (notifErr) {
        console.error('Failed to notify deleteClassroom:', notifErr);
    }
}

export async function unenrollClassroomStudent(
    dbClient: DbClient,
    { classGroupId, studentId, userId, institutionId }: ClassroomStudentAccessScope,
) {
    const enrollment = await dbClient
        .selectFrom('class_groups as cg')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .innerJoin('enrollments as enr', 'enr.class_group_id', 'cg.class_group_id')
        .innerJoin('students as st', 'st.student_id', 'enr.student_id')
        .select(['enr.enrollment_id'])
        .where('cg.class_group_id', '=', classGroupId)
        .where('cr.user_id', '=', userId)
        .where('r.role_name', '=', 'instructor')
        .where('cg.institution_id', '=', institutionId)
        .where('st.student_id', '=', studentId)
        .where('st.institution_id', '=', institutionId)
        .executeTakeFirst();

    if (!enrollment) {
        throw new HTTPException(404, { message: 'Student enrollment not found.' });
    }

    const details = await dbClient
        .selectFrom('students as st')
        .innerJoin('user_profiles as up', 'up.user_id', 'st.user_id')
        .select(['st.student_number', 'up.first_name', 'up.last_name'])
        .where('st.student_id', '=', studentId)
        .executeTakeFirst();

    const classroomNameRow = await dbClient
        .selectFrom('class_groups')
        .select(['class_name'])
        .where('class_group_id', '=', classGroupId)
        .executeTakeFirst();

    await dbClient
        .deleteFrom('enrollments')
        .where('enrollment_id', '=', enrollment.enrollment_id)
        .execute();

    if (details) {
        try {
            await ActivityNotificationService.notifyInstitutionActivityDeleted({
                dbClient,
                actorUserId: userId,
                institutionId,
                targetType: 'CLASSROOM_STUDENT',
                targetId: studentId,
                targetLabel: `${details.first_name || ''} ${details.last_name} (${details.student_number})`,
                title: 'Student removed from classroom',
                message: `Student "${details.first_name || ''} ${details.last_name}" (${details.student_number}) was removed from classroom "${classroomNameRow?.class_name || 'Classroom'}".`,
                sourceModule: 'classrooms',
                sourceAction: 'unenroll-student',
            });
        } catch (notifErr) {
            console.error('Failed to notify unenrollClassroomStudent:', notifErr);
        }
    }
}
