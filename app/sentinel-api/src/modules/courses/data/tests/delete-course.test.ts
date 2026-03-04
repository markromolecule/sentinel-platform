import { describe, expect } from 'vitest';
import { type DbClient } from '../../../../lib/create-db-client';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { deleteCourseData } from '../delete-course';
import { createTestCoursesInDB, makeFakeCourse } from './__test-utils__/make-fake-course';
import {
    createTestUsersInDB,
    makeFakeUser,
} from '../../../departments/data/tests/__test-utils__/make-fake-user';
import {
    createTestDepartmentsInDB,
    makeFakeDepartment,
} from '../../../departments/data/tests/__test-utils__/make-fake-department';

const setupTestData = async ({ dbClient }: { dbClient: DbClient }) => {
    const mockUser = makeFakeUser();
    await createTestUsersInDB({ dbClient, values: [mockUser] });

    const mockDepartment = makeFakeDepartment({ created_by: mockUser.id });
    await createTestDepartmentsInDB({ dbClient, values: [mockDepartment] });

    const mockCourse = makeFakeCourse({
        department_id: mockDepartment.department_id,
        created_by: mockUser.id,
    });
    await createTestCoursesInDB({ dbClient, values: [mockCourse] });

    return { mockCourse };
};

describe('Delete Course Data Access', () => {
    testWithDbClient('should successfully delete a course', async ({ dbClient }) => {
        const { mockCourse } = await setupTestData({ dbClient });

        const deletedCourse = await deleteCourseData({
            dbClient,
            id: mockCourse.course_id!,
        });

        expect(deletedCourse).toBeDefined();
        expect(deletedCourse.course_id).toEqual(mockCourse.course_id);

        const fetchedCourse = await dbClient
            .selectFrom('courses')
            .where('course_id', '=', mockCourse.course_id!)
            .selectAll()
            .executeTakeFirst();

        expect(fetchedCourse).toBeUndefined();
    });

    testWithDbClient(
        'should throw error when deleting non-existent course',
        async ({ dbClient }) => {
            await expect(
                deleteCourseData({
                    dbClient,
                    id: 'non-existent-guid',
                }),
            ).rejects.toThrow();
        },
    );
});
