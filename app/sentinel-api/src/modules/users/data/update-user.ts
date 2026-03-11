import { type DbClient } from '@sentinel/db';
import { type UpdateUserBody } from '../user.dto';
import { HTTPException } from 'hono/http-exception';

import { getUserData } from './get-user';

export type UpdateUserDataArgs = {
    dbClient: DbClient;
    id: string;
    values: UpdateUserBody;
};

export async function updateUserData({ dbClient, id, values }: UpdateUserDataArgs) {
    // 1. Update user_profiles
    const profileUpdates: any = { updated_at: new Date().toISOString() };
    if (values.firstName) profileUpdates.first_name = values.firstName;
    if (values.lastName) profileUpdates.last_name = values.lastName;
    if (values.institution) profileUpdates.institution_id = values.institution;

    if (Object.keys(profileUpdates).length > 1) {
        // 1 because updated_at is always there
        await dbClient
            .updateTable('user_profiles')
            .set(profileUpdates)
            .where('user_id', '=', id)
            .execute();
    }

    // 2. Update or Delete student record depending on role
    if (values.role === 'student' || values.studentNo || values.department) {
        // Find existing student
        const existingStudent = await dbClient
            .selectFrom('students')
            .where('user_id', '=', id)
            .select('student_id')
            .executeTakeFirst();

        if (existingStudent) {
            const studentUpdates: any = {};
            if (values.studentNo !== undefined) studentUpdates.student_number = values.studentNo;
            if (values.department !== undefined) studentUpdates.department_id = values.department;
            if (values.institution !== undefined)
                studentUpdates.institution_id = values.institution;

            if (Object.keys(studentUpdates).length > 0) {
                await dbClient
                    .updateTable('students')
                    .set(studentUpdates)
                    .where('user_id', '=', id)
                    .execute();
            }
        } else if (
            values.role === 'student' &&
            values.studentNo &&
            values.department &&
            values.institution
        ) {
            // Role changed to student, insert new student record
            await dbClient
                .insertInto('students')
                .values({
                    user_id: id,
                    student_number: values.studentNo,
                    department_id: values.department,
                    institution_id: values.institution,
                })
                .execute();
        }
    } else if (values.role && (values.role as any) !== 'student') {
        // If role was changed from student to something else, delete student record
        await dbClient.deleteFrom('students').where('user_id', '=', id).execute();
    }

    // 3. Retrieve the updated data to return
    const profile = await dbClient
        .selectFrom('user_profiles')
        .where('user_id', '=', id)
        .select('institution_id')
        .executeTakeFirst();

    if (!profile || !profile.institution_id) {
        throw new HTTPException(404, { message: 'User profile not found after update' });
    }

    return await getUserData({ dbClient, id, institutionId: profile.institution_id });
}

export type UpdateUserDataResponse = Awaited<ReturnType<typeof updateUserData>>;
