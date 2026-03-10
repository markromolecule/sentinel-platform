import { describe, expect } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { createCourseData } from '../create-course';
import { makeFakeCourse } from './__test-utils__/make-fake-course';
import {
    createTestUsersInDB,
    makeFakeUser,
} from '../../../departments/data/tests/__test-utils__/make-fake-user';
import {
    createTestDepartmentsInDB,
    makeFakeDepartment,
} from '../../../departments/data/tests/__test-utils__/make-fake-department';

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

    // We need a mock user to assign created_by, and a department to assign department_id
    const mockUser = makeFakeUser();
    await createTestUsersInDB({ dbClient, values: [mockUser] });

    const mockDepartment = makeFakeDepartment({
        created_by: mockUser.id,
        institution_id: mockInstitution.id,
    });
    await createTestDepartmentsInDB({ dbClient, values: [mockDepartment] });

    return { mockUser, mockDepartment, mockInstitution };
};

describe('Create Course Data Access', () => {
    testWithDbClient('should create a course successfully', async ({ dbClient }) => {
        // Setup mock user and department for FKs
        const { mockUser, mockDepartment, mockInstitution } = await setupTestData({ dbClient });

        const mockCourse = makeFakeCourse({
            created_by: mockUser.id,
            department_id: mockDepartment.department_id,
            institution_id: mockInstitution.id,
        });

        const createdCourse = await createCourseData({
            dbClient,
            values: {
                code: mockCourse.code,
                title: mockCourse.title,
                department_id: mockCourse.department_id,
                institution_id: mockCourse.institution_id,
                description: mockCourse.description,
                created_by: mockCourse.created_by,
            },
        });

        // Assertions
        expect(createdCourse).toBeDefined();
        expect(createdCourse.course_id).toBeDefined();
        expect(createdCourse.code).toEqual(mockCourse.code);
        expect(createdCourse.title).toEqual(mockCourse.title);
        expect(createdCourse.department_id).toEqual(mockDepartment.department_id);
        expect(createdCourse.description).toEqual(mockCourse.description);
        expect(createdCourse.created_by).toEqual(mockUser.id);
        expect(createdCourse.created_at).toBeDefined();
        expect(createdCourse.updated_at).toBeDefined();

        // Verify insertion accurately exists
        const currentCourses = await dbClient
            .selectFrom('courses')
            .where('code', '=', mockCourse.code)
            .selectAll()
            .execute();
        expect(currentCourses.length).toBe(1);
    });

    testWithDbClient('should throw error on duplicate course code', async ({ dbClient }) => {
        // Setup mock user and department for FKs
        const { mockUser, mockDepartment, mockInstitution } = await setupTestData({ dbClient });

        const mockCourse = makeFakeCourse({
            created_by: mockUser.id,
            department_id: mockDepartment.department_id,
            institution_id: mockInstitution.id,
        });

        // Insert first
        await createCourseData({
            dbClient,
            values: {
                code: mockCourse.code,
                title: mockCourse.title,
                department_id: mockCourse.department_id,
                institution_id: mockCourse.institution_id,
                description: mockCourse.description,
                created_by: mockCourse.created_by,
            },
        });

        // Attempting to insert duplicate code should throw
        await expect(
            createCourseData({
                dbClient,
                values: {
                    code: mockCourse.code, // Duplicate code
                    title: 'A Different Title',
                    department_id: mockCourse.department_id,
                    institution_id: mockCourse.institution_id,
                    description: mockCourse.description,
                    created_by: mockCourse.created_by,
                },
            }),
        ).rejects.toThrow();
    });
});
