import { type DbClient, type DB } from '@sentinel/db';
import { type Updateable } from 'kysely';
import { type UpdateUserBody } from '../user.dto';
import { HTTPException } from 'hono/http-exception';
import { getUserData } from './get-user';

export type UpdateUserDataArgs = {
    dbClient: DbClient;
    id: string;
    values: UpdateUserBody;
};

export async function updateUserData({ dbClient, id, values }: UpdateUserDataArgs) {
    // 0. Prevent updating superadmin accounts
    const targetUser = await dbClient
        .selectFrom('user_roles as ur')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .where('ur.user_id', '=', id)
        .select('r.role_name')
        .executeTakeFirst();

    if (targetUser?.role_name === 'superadmin') {
        throw new HTTPException(403, {
            message: 'Forbidden: Cannot update superadmin account',
        });
    }

    // 1. Update user_profiles
    const profileUpdates: Updateable<DB['user_profiles']> = {
        updated_at: new Date().toISOString(),
    };

    if (values.firstName) profileUpdates.first_name = values.firstName;
    if (values.lastName) profileUpdates.last_name = values.lastName;
    if (values.institution) profileUpdates.institution_id = values.institution;
    if (values.department) profileUpdates.department_id = values.department;
    if (values.course) profileUpdates.course_id = values.course;

    if (Object.keys(profileUpdates).length > 1) {
        await dbClient
            .updateTable('user_profiles')
            .set(profileUpdates)
            .where('user_id', '=', id)
            .execute();
    }

    // 2. Update user_roles if role changed
    let newRoleName = values.role?.toLowerCase();

    if (newRoleName) {
        const roleRecord = await dbClient
            .selectFrom('roles')
            .where('role_name', '=', newRoleName)
            .select('role_id')
            .executeTakeFirst();

        if (!roleRecord) {
            throw new HTTPException(400, { message: `Invalid role: ${newRoleName}` });
        }

        // Replace existing role
        await dbClient.deleteFrom('user_roles').where('user_id', '=', id).execute();
        await dbClient
            .insertInto('user_roles')
            .values({ user_id: id, role_id: roleRecord.role_id })
            .execute();
    } else {
        // If role wasn't passed, default to their current role for the logic below
        newRoleName = targetUser?.role_name;
    }

    // 3. Update Student/Instructor Records using Upserts
    const staffRoles = ['admin', 'instructor', 'proctor', 'disciplinary_officer'];
    const isStudent = newRoleName === 'student';
    const isStaff = newRoleName && staffRoles.includes(newRoleName);

    const hasIdentification = values.studentNo !== undefined;
    const hasDepartment = values.department !== undefined;

    if (isStudent || (!values.role && (hasIdentification || hasDepartment))) {
        // Insert or Update student
        await dbClient
            .insertInto('students')
            .values({
                user_id: id,
                student_number: values.studentNo ?? '',
                department_id: values.department!,
                course_id: values.course,
                institution_id: values.institution!,
            })
            .onConflict((oc) =>
                oc.column('user_id').doUpdateSet({
                    student_number: values.studentNo,
                    department_id: values.department,
                    course_id: values.course,
                    institution_id: values.institution,
                }),
            )
            .execute();

        // Strict cleanup
        await dbClient.deleteFrom('instructors').where('user_id', '=', id).execute();
    } else if (isStaff || (!values.role && (hasIdentification || hasDepartment))) {
        // Upsert Instructor
        await dbClient
            .insertInto('instructors')
            .values({
                user_id: id,
                employee_number: values.studentNo ?? `EMP-${id.slice(0, 8)}`,
                department_id: values.department!,
                course_id: values.course,
                institution_id: values.institution!,
            })
            .onConflict((oc) =>
                oc.column('user_id').doUpdateSet({
                    employee_number: values.studentNo,
                    department_id: values.department,
                    course_id: values.course,
                    institution_id: values.institution,
                }),
            )
            .execute();
        // Cleanup
        await dbClient.deleteFrom('students').where('user_id', '=', id).execute();
    }

    // 4. Retrieve the updated data
    const profile = await dbClient
        .selectFrom('user_profiles')
        .where('user_id', '=', id)
        .select('institution_id')
        .executeTakeFirst();

    if (!profile?.institution_id) {
        throw new HTTPException(404, { message: 'User profile not found after update' });
    }
    return await getUserData({ dbClient, id, institutionId: profile.institution_id });
}

export type UpdateUserDataResponse = Awaited<ReturnType<typeof updateUserData>>;
