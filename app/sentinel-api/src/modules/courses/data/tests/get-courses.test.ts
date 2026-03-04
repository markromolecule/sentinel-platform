import { describe, expect } from 'vitest';
import { type DbClient } from '../../../../lib/create-db-client';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { getCoursesData } from '../get-courses';
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

    const mockCourses = [
        makeFakeCourse({
            title: 'Zebra Studies',
            code: 'Z101',
            department_id: mockDepartment.department_id,
            created_by: mockUser.id,
        }),
        makeFakeCourse({
            title: 'Aardvark Anatomy',
            code: 'A101',
            department_id: mockDepartment.department_id,
            created_by: mockUser.id,
        }),
    ];
    await createTestCoursesInDB({ dbClient, values: mockCourses });

    return { mockCourses };
};

describe('Get Courses Data Access', () => {
    testWithDbClient(
        'should fetch all courses ordered by title ascending',
        async ({ dbClient }) => {
            await setupTestData({ dbClient });

            const courses = await getCoursesData({ dbClient });

            expect(courses).toBeDefined();
            // Check sorting logic
            expect(courses.length).toBeGreaterThanOrEqual(2);

            const aardvarkIndex = courses.findIndex((c) => c.title === 'Aardvark Anatomy');
            const zebraIndex = courses.findIndex((c) => c.title === 'Zebra Studies');

            expect(aardvarkIndex).toBeLessThan(zebraIndex);
        },
    );
});
