import { describe, expect } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { updateCourseData } from '../update-course';
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

    return { mockUser, mockDepartment, mockCourse };
};

describe('Update Course Data Access', () => {
    testWithDbClient(
        'should successfully update a course title and description',
        async ({ dbClient }) => {
            const { mockCourse } = await setupTestData({ dbClient });

            const updatedCourse = await updateCourseData({
                dbClient,
                id: mockCourse.course_id!,
                values: {
                    title: 'New Title Data',
                    description: 'Updated description for this course',
                },
            });

            expect(updatedCourse).toBeDefined();
            expect(updatedCourse.course_id).toEqual(mockCourse.course_id);
            expect(updatedCourse.title).toEqual('New Title Data');
            expect(updatedCourse.description).toEqual('Updated description for this course');

            // Ensure other fields remain unchanged
            expect(updatedCourse.code).toEqual(mockCourse.code);

            const fetchedCourse = await dbClient
                .selectFrom('courses')
                .where('course_id', '=', mockCourse.course_id!)
                .selectAll()
                .executeTakeFirst();

            expect(fetchedCourse?.title).toEqual('New Title Data');
            expect(fetchedCourse?.description).toEqual('Updated description for this course');
        },
    );

    testWithDbClient(
        'should throw error when updating non-existent course',
        async ({ dbClient }) => {
            await expect(
                updateCourseData({
                    dbClient,
                    id: 'non-existent-guid',
                    values: {
                        title: 'Non-existent update',
                    },
                }),
            ).rejects.toThrow();
        },
    );
});
