import { type DbClient } from '@sentinel/db';
import { getStudentWhitelistByStudentNumberData } from '@/modules/identity/student-whitelist/data/get-student-whitelist-by-student-number';
import type { NormalizedStudentOnboardingInput } from './student-onboarding.types';

export async function loadStudentOnboardingContext(
    dbClient: DbClient,
    userId: string,
    studentData: NormalizedStudentOnboardingInput,
) {
    const user = await dbClient
        .selectFrom('auth.users')
        .where('id', '=', userId)
        .selectAll()
        .executeTakeFirst();

    if (!user) {
        throw new Error('User not found');
    }

    const existingStudent = await dbClient
        .selectFrom('students')
        .where('user_id', '=', userId)
        .selectAll()
        .executeTakeFirst();

    if (existingStudent) {
        throw new Error('Student profile already exists');
    }

    const whitelistRecord = await getStudentWhitelistByStudentNumberData({
        dbClient,
        institutionId: studentData.institutionId,
        studentNumber: studentData.studentNumber,
    });

    const conflictingStudent = await dbClient
        .selectFrom('students')
        .where('institution_id', '=', studentData.institutionId)
        .where('student_number', '=', studentData.studentNumber)
        .selectAll()
        .executeTakeFirst();

    const studentRole = await dbClient
        .selectFrom('roles')
        .select('role_id')
        .where('role_name', '=', 'student')
        .executeTakeFirst();

    return {
        user,
        whitelistRecord,
        conflictingStudent,
        studentRole,
    };
}

export type StudentOnboardingContext = Awaited<
    ReturnType<typeof loadStudentOnboardingContext>
>;
