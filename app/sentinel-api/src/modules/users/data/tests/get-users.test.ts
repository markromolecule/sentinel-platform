import { describe, expect } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { getUsersData } from '../get-users';
import { getUserData } from '../get-user';
import { faker } from '@faker-js/faker';

// Setup test data manually for users
const setupTestData = async ({ dbClient }: { dbClient: DbClient }) => {
    // 1. Create institution
    const mockInstitution = await dbClient
        .insertInto('institutions')
        .values({
            name: `Test Inst ${Date.now()}_${Math.random()}`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    // 2. Create auth user
    const userId = faker.string.uuid();
    await dbClient
        .insertInto('auth.users')
        .values({
            id: userId,
            email: faker.internet.email(),
            phone: faker.phone.number(),
            role: 'authenticated',
            raw_user_meta_data: { role: 'authenticated' },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .execute();

    // 3. Create profile
    await dbClient
        .insertInto('user_profiles')
        .values({
            user_id: userId,
            institution_id: mockInstitution.id,
            first_name: 'John',
            last_name: 'Doe',
        })
        .onConflict((oc: any) =>
            oc.column('user_id').doUpdateSet({
                institution_id: mockInstitution.id,
                first_name: 'John',
                last_name: 'Doe',
            }),
        )
        .execute();

    return { mockInstitution, userId };
};

describe('Users Data Access', () => {
    testWithDbClient('should fetch all users for an institution', async ({ dbClient }) => {
        const { mockInstitution, userId } = await setupTestData({ dbClient });

        const users = await getUsersData({
            dbClient,
            institutionId: mockInstitution.id,
        });

        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThanOrEqual(1);

        const fetchedUser = users.find((u: any) => u.user_id === userId);
        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.firstName).toBe('John');
        expect(fetchedUser?.lastName).toBe('Doe');
        expect(fetchedUser?.role).toBe('authenticated');
    });

    testWithDbClient('should fetch a single user by id', async ({ dbClient }) => {
        const { mockInstitution, userId } = await setupTestData({ dbClient });

        const user = await getUserData({
            dbClient,
            id: userId,
            institutionId: mockInstitution.id,
        });

        expect(user).toBeDefined();
        expect(user.user_id).toBe(userId);
        expect(user.firstName).toBe('John');
        expect(user.lastName).toBe('Doe');
    });
});
