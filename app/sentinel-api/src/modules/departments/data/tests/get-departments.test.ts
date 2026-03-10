import { describe, expect, it } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { getDepartmentsData } from '../get-departments';
import {
    createTestDepartmentsInDB,
    makeFakeDepartment,
} from './__test-utils__/make-fake-department';
import { createTestUsersInDB, makeFakeUser } from './__test-utils__/make-fake-user';

const setupTestData = async ({ dbClient }: { dbClient: DbClient }) => {
    // Generate an institution
    const mockInstitution = await dbClient
        .insertInto('institutions')
        .values({
            name: `Test Inst ${Date.now()}_${Math.random()}`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const mockUser = makeFakeUser();
    await createTestUsersInDB({ dbClient, values: [mockUser] });

    const mockDepartments = [
        makeFakeDepartment({
            department_name: 'Zeta Dept',
            created_by: mockUser.id,
            institution_id: mockInstitution.id,
        }),
        makeFakeDepartment({
            department_name: 'Alpha Dept',
            created_by: mockUser.id,
            institution_id: mockInstitution.id,
        }),
    ];
    await createTestDepartmentsInDB({ dbClient, values: mockDepartments });

    return { mockDepartments, mockInstitution };
};

describe('Get Departments Data Access', () => {
    testWithDbClient(
        'should fetch all departments ordered by name ascending',
        async ({ dbClient }) => {
            const { mockInstitution } = await setupTestData({ dbClient });

            const departments = await getDepartmentsData({
                dbClient,
                institutionId: mockInstitution.id,
            });

            expect(departments).toBeDefined();
            // Since test db is shared during a suite but rolled back per test, length is at least 2.
            // Also checks explicit 'order by' logic.
            expect(departments.length).toBeGreaterThanOrEqual(2);

            const alphaIndex = departments.findIndex((d) => d.department_name === 'Alpha Dept');
            const zetaIndex = departments.findIndex((d) => d.department_name === 'Zeta Dept');

            expect(alphaIndex).toBeLessThan(zetaIndex);
        },
    );
});
