import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateUserDataArgs = {
    dbClient: DbClient;
    userId: string;
    profile: Insertable<DB['user_profiles']>;
    student?: Insertable<DB['students']>;
    email: string;
    role: string;
};

export async function createUserData({
    dbClient,
    userId,
    profile,
    student,
    email,
    role,
}: CreateUserDataArgs) {
    // 1. Upsert user profile (handle trigger conflicts)
    await dbClient
        .insertInto('user_profiles')
        .values({
            ...profile,
            user_id: userId,
            status: 'ACTIVE',
        })
        .onConflict((oc: any) =>
            oc.column('user_id').doUpdateSet({
                ...profile,
                status: 'ACTIVE',
            }),
        )
        .execute();

    // 2. Create student record if role is student
    if (role === 'student' && student) {
        await dbClient
            .insertInto('students')
            .values({
                ...student,
                user_id: userId,
            })
            .onConflict((oc: any) =>
                oc.column('user_id').doUpdateSet({
                    ...student,
                }),
            )
            .execute();
    }

    // 3. Build response using dbClient to fetch human-readable names
    const d = student?.department_id
        ? await dbClient
              .selectFrom('departments')
              .where('department_id', '=', student.department_id)
              .select('department_name')
              .executeTakeFirst()
        : null;

    const i = profile.institution_id
        ? await dbClient
              .selectFrom('institutions')
              .where('id', '=', profile.institution_id)
              .select('name')
              .executeTakeFirst()
        : null;

    return {
        user_id: userId,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email,
        role,
        department: d?.department_name ?? null,
        studentNo: student?.student_number ?? null,
        institution: i?.name ?? null,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: null,
        created_by: null,
        updated_by: null,
    };
}

export type CreateUserDataResponse = Awaited<ReturnType<typeof createUserData>>;
