import { describe, expect, it } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { deleteDepartmentData } from '../delete-department';
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

describe('Delete Department Data Access', () => {
    testWithDbClient('should delete an unused department', async ({ dbClient }) => {
        const { insertedDepartment } = await setupTestData({ dbClient });

        const deletedDepartment = await deleteDepartmentData({
            dbClient,
            id: insertedDepartment.department_id,
        });

        expect(deletedDepartment).toBeDefined();
        expect(deletedDepartment.department_id).toBe(insertedDepartment.department_id);

        // Verify count went down
        const verify = await dbClient
            .selectFrom('departments')
            .where('department_id', '=', insertedDepartment.department_id)
            .selectAll()
            .execute();

        expect(verify.length).toBe(0);
    });

    testWithDbClient('should throw NotFoundError if deleting absent UUID', async ({ dbClient }) => {
        const fakeUUID = '00000000-0000-0000-0000-000000000000';

        await expect(
            deleteDepartmentData({
                dbClient,
                id: fakeUUID,
            }),
        ).rejects.toThrow('no result');
    });
});
