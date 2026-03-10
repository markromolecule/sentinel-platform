import { describe, expect, it } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { updateDepartmentData } from '../update-department';
import {
    createTestDepartmentsInDB,
    makeFakeDepartment,
} from './__test-utils__/make-fake-department';
import { createTestUsersInDB, makeFakeUser } from './__test-utils__/make-fake-user';

const setupTestData = async ({ dbClient }: { dbClient: DbClient }) => {
    const mockUser = makeFakeUser();
    await createTestUsersInDB({ dbClient, values: [mockUser] });

    const mockDepartment = makeFakeDepartment({ created_by: mockUser.id });
    const [insertedDepartment] = await createTestDepartmentsInDB({
        dbClient,
        values: [mockDepartment],
    });

    return { insertedDepartment };
};

describe('Update Department Data Access', () => {
    testWithDbClient(
        'should update existing department name and code partially',
        async ({ dbClient }) => {
            const { insertedDepartment } = await setupTestData({ dbClient });

            const updatedDepartment = await updateDepartmentData({
                dbClient,
                id: insertedDepartment.department_id,
                values: {
                    department_name: 'New Advanced Logic',
                },
            });

            expect(updatedDepartment).toBeDefined();
            expect(updatedDepartment.department_name).toBe('New Advanced Logic');
            // Unchanged value
            expect(updatedDepartment.department_code).toBe(insertedDepartment.department_code);
        },
    );

    testWithDbClient('should throw NotFoundError if updating absent UUID', async ({ dbClient }) => {
        const fakeUUID = '00000000-0000-0000-0000-000000000000';

        await expect(
            updateDepartmentData({
                dbClient,
                id: fakeUUID,
                values: { department_name: 'Ghost' },
            }),
        ).rejects.toThrow('no result');
    });
});
