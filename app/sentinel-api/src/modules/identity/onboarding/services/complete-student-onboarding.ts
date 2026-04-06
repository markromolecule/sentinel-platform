import { type DbClient } from '@sentinel/db';
import { createStudentData } from '../data/create-student';
import type { StudentOnboardingContext } from './load-student-onboarding-context';
import type { NormalizedStudentOnboardingInput } from './student-onboarding.types';

export async function completeStudentOnboarding(
    dbClient: DbClient,
    userId: string,
    studentData: NormalizedStudentOnboardingInput,
    context: StudentOnboardingContext,
) {
    const now = new Date();

    await dbClient
        .updateTable('user_profiles')
        .set({
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            institution_id: studentData.institutionId,
            department_id: studentData.departmentId,
            course_id: studentData.courseId,
            updated_at: now,
        })
        .where('user_id', '=', userId)
        .execute();

    const createdStudent = await createStudentData({
        dbClient,
        values: {
            user_id: userId,
            student_number: studentData.studentNumber,
            institution_id: studentData.institutionId,
            department_id: studentData.departmentId,
            course_id: studentData.courseId,
        },
    });

    await dbClient
        .insertInto('user_roles')
        .values({
            user_id: userId,
            role_id: context.studentRole!.role_id as any,
        })
        .onConflict((oc) => oc.columns(['user_id', 'role_id']).doNothing())
        .execute();

    await dbClient
        .updateTable('student_whitelist')
        .set({
            claimed_user_id: userId,
            claimed_at: now,
            updated_at: now,
            updated_by: userId,
        })
        .where('whitelist_id', '=', context.whitelistRecord!.whitelist_id)
        .execute();

    return createdStudent;
}
