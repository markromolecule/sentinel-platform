import { describe, expect, it } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { createDepartmentData } from '../create-department';
import { makeFakeDepartment } from './__test-utils__/make-fake-department';
import { createTestUsersInDB, makeFakeUser } from './__test-utils__/make-fake-user';

// Essential test setup pattern for DB tests
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
    return { mockUser, mockInstitution };
};

describe('Create Department Data Access', () => {
    testWithDbClient('should create a department successfully', async ({ dbClient }) => {
        // Setup mock user and institution
        const { mockUser, mockInstitution } = await setupTestData({ dbClient });

        const mockDepartment = makeFakeDepartment({
            created_by: mockUser.id,
            institution_id: mockInstitution.id,
        });

        const createdDepartment = await createDepartmentData({
            dbClient,
            values: {
                department_name: mockDepartment.department_name,
                department_code: mockDepartment.department_code,
                institution_id: mockDepartment.institution_id,
                created_by: mockDepartment.created_by!,
            },
        });

        // Assertions
        expect(createdDepartment).toBeDefined();
        expect(createdDepartment.department_id).toBeDefined();
        expect(createdDepartment.department_name).toEqual(mockDepartment.department_name);
        expect(createdDepartment.department_code).toEqual(mockDepartment.department_code);
        expect(createdDepartment.created_by).toEqual(mockUser.id);
        expect(createdDepartment.created_at).toBeDefined();

        // Verify insertion accurately exists
        const currentDepartments = await dbClient
            .selectFrom('departments')
            .where('department_name', '=', mockDepartment.department_name)
            .selectAll()
            .execute();
        expect(currentDepartments.length).toBe(1);
    });

    testWithDbClient('should throw error on duplicate department name', async ({ dbClient }) => {
        // Setup mock user for createdBy FK
        const { mockUser, mockInstitution } = await setupTestData({ dbClient });

        const mockDepartment = makeFakeDepartment({
            created_by: mockUser.id,
            institution_id: mockInstitution.id,
        });

        // Insert first
        await createDepartmentData({
            dbClient,
            values: {
                department_name: mockDepartment.department_name,
                department_code: mockDepartment.department_code,
                institution_id: mockDepartment.institution_id,
                created_by: mockDepartment.created_by!,
            },
        });

        // Attempting to insert duplicate name should throw
        await expect(
            createDepartmentData({
                dbClient,
                values: {
                    department_name: mockDepartment.department_name,
                    department_code: 'DIF', // Different code, same name
                    institution_id: mockDepartment.institution_id,
                    created_by: mockDepartment.created_by!,
                },
            }),
        ).rejects.toThrow();
    });
});
