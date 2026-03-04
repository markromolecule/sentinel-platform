import { type DbClient } from '../../../../../lib/create-db-client';
import { type DB } from '../../../../../lib/types';
import { type Insertable } from 'kysely';
import { faker } from '@faker-js/faker';

// Create a fake course with realistic test data
export function makeFakeCourse(overrides?: Partial<Insertable<DB['courses']>>) {
    return {
        course_id: faker.string.uuid(),
        code: faker.helpers.arrayElement(['CS101', 'IT201', 'IS301', 'ENG101']),
        title: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        department_id: faker.string.uuid(), // Note: Usually overridden in tests pointing to an inserted department ID
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        created_by: faker.string.uuid(), // Note: Usually overridden in tests pointing to an inserted auth.users ID
        ...overrides,
    } as Insertable<DB['courses']>;
}

export type CreateTestCoursesInDBArgs = {
    dbClient: DbClient;
    values?: Partial<Insertable<DB['courses']>> | Partial<Insertable<DB['courses']>>[];
};

export async function createTestCoursesInDB({ dbClient, values }: CreateTestCoursesInDBArgs) {
    const fakeCourses = Array.isArray(values) ? values.map(makeFakeCourse) : makeFakeCourse(values);

    const createdCourses = await dbClient
        .insertInto('courses')
        .values(fakeCourses)
        .returningAll()
        .execute();

    return createdCourses;
}
