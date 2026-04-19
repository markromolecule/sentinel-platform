import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    type ClassroomAccessScope,
    type ClassroomStudentAccessScope,
} from '../helper/classroom.types';
import { getClassGroupColumnSupport } from '../helper/classroom-schema-compat';

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
}

export async function deleteClassroom(
    dbClient: DbClient,
    { classGroupId, userId, institutionId }: ClassroomAccessScope,
) {
    const classroom = await dbClient
        .selectFrom('class_groups as cg')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .select(['cg.class_group_id'])
        .where('cg.class_group_id', '=', classGroupId)
        .where('cr.user_id', '=', userId)
        .where('r.role_name', '=', 'instructor')
        .where('cg.institution_id', '=', institutionId)
        .executeTakeFirst();

    if (!classroom) {
        throw new HTTPException(404, { message: 'Classroom not found.' });
    }

    await dbClient.deleteFrom('class_groups').where('class_group_id', '=', classGroupId).execute();
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

    await dbClient
        .deleteFrom('enrollments')
        .where('enrollment_id', '=', enrollment.enrollment_id)
        .execute();
}
