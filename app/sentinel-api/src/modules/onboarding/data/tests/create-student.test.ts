import { describe, expect, it } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { createStudentData } from '../create-student';
import { makeFakeStudent } from './__test-utils__/make-fake-student';
import {
    createTestInstitutionsInDB,
    makeFakeInstitution,
} from './__test-utils__/make-fake-institution';
import {
    createTestUsersInDB,
    makeFakeUser,
} from '../../../departments/data/tests/__test-utils__/make-fake-user';
import {
    createTestDepartmentsInDB,
    makeFakeDepartment,
} from '../../../departments/data/tests/__test-utils__/make-fake-department';

// Essential test setup pattern for DB tests ensuring strict foreign key isolation
const setupTestData = async ({ dbClient }: { dbClient: DbClient }) => {
    // 1. Create User
    const mockUser = makeFakeUser();
    await createTestUsersInDB({ dbClient, values: [mockUser] });

    // 2. Create Institution
    const mockInstitution = makeFakeInstitution();
    await createTestInstitutionsInDB({ dbClient, values: [mockInstitution] });

    // 3. Create Department (needs created_by user relation)
    const mockDepartment = makeFakeDepartment({ created_by: mockUser.id });
    const [insertedDepartment] = await createTestDepartmentsInDB({
        dbClient,
        values: [mockDepartment],
    });

    return { mockUser, mockInstitution, mockDepartment: insertedDepartment };
};

describe('Create Student Data Access', () => {
    testWithDbClient(
        'should create a student profile mapped to relations',
        async ({ dbClient }) => {
            // FK Setup mapping User, Institution, and Department
            const { mockUser, mockInstitution, mockDepartment } = await setupTestData({ dbClient });

            const mockStudent = makeFakeStudent({
                user_id: mockUser.id,
                institution_id: mockInstitution.id,
                department_id: mockDepartment.department_id,
            });

            const createdStudent = await createStudentData({
                dbClient,
                values: {
                    student_number: mockStudent.student_number,
                    user_id: mockStudent.user_id,
                    institution_id: mockStudent.institution_id,
                    department_id: mockStudent.department_id,
                },
            });

            // Assertions verifying structural mappings
            expect(createdStudent).toBeDefined();
            expect(createdStudent.student_id).toBeDefined();
            expect(createdStudent.student_number).toEqual(mockStudent.student_number);
            expect(createdStudent.user_id).toEqual(mockUser.id);
            expect(createdStudent.institution_id).toEqual(mockInstitution.id);
            expect(createdStudent.department_id).toEqual(mockDepartment.department_id);
        },
    );

    testWithDbClient(
        'should throw error if violating unique constraints (duplicate user_id)',
        async ({ dbClient }) => {
            const { mockUser, mockInstitution, mockDepartment } = await setupTestData({ dbClient });

            const mockStudent = makeFakeStudent({
                user_id: mockUser.id,
                institution_id: mockInstitution.id,
                department_id: mockDepartment.department_id,
            });

            // Insert first
            await createStudentData({
                dbClient,
                values: {
                    student_number: mockStudent.student_number,
                    user_id: mockStudent.user_id,
                    institution_id: mockStudent.institution_id,
                    department_id: mockStudent.department_id,
                },
            });

            // Cannot map the same user_id strictly mapped 1:1 on students table
            await expect(
                createStudentData({
                    dbClient,
                    values: {
                        student_number: '999999',
                        user_id: mockStudent.user_id, // Duplicate User ID
                        institution_id: mockStudent.institution_id,
                        department_id: mockDepartment.department_id,
                    },
                }),
            ).rejects.toThrow();
        },
    );
});
