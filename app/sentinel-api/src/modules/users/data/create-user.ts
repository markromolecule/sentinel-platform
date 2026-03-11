import { type DbClient } from '@sentinel/db';

export type CreateUserDataArgs = {
    dbClient: DbClient;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    institutionId: string;
    departmentId?: string;
    studentNo?: string;
};

export async function createUserData({
    dbClient,
    userId,
    firstName,
    lastName,
    email,
    role,
    institutionId,
    departmentId,
    studentNo,
}: CreateUserDataArgs) {
    // 1. Upsert user profile (handle trigger conflicts)
    await dbClient
        .insertInto('user_profiles')
        .values({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            institution_id: institutionId,
            status: 'ACTIVE',
        })
        .onConflict((oc) =>
            oc.column('user_id').doUpdateSet({
                first_name: firstName,
                last_name: lastName,
                institution_id: institutionId,
                status: 'ACTIVE',
            }),
        )
        .execute();

    // 2. Create student record if role is student
    if (role === 'student' && studentNo && departmentId) {
        await dbClient
            .insertInto('students')
            .values({
                user_id: userId,
                student_number: studentNo,
                department_id: departmentId,
                institution_id: institutionId,
            })
            .onConflict((oc) =>
                oc.column('user_id').doUpdateSet({
                    student_number: studentNo,
                    department_id: departmentId,
                }),
            )
            .execute();
    }

    // 3. Build response using dbClient to fetch human-readable names
    const d = departmentId
        ? await dbClient
              .selectFrom('departments')
              .where('department_id', '=', departmentId)
              .select('department_name')
              .executeTakeFirst()
        : null;

    const i = await dbClient
        .selectFrom('institutions')
        .where('id', '=', institutionId)
        .select('name')
        .executeTakeFirst();

    return {
        user_id: userId,
        firstName,
        lastName,
        email,
        role,
        department: d?.department_name ?? null,
        studentNo: studentNo ?? null,
        institution: i?.name ?? null,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: null,
        created_by: null,
        updated_by: null,
    };
}

export type CreateUserDataResponse = Awaited<ReturnType<typeof createUserData>>;
