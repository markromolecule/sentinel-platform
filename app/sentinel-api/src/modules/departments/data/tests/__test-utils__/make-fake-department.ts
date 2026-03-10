import { type DbClient } from '@sentinel/db';
import { type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';
import { faker } from '@faker-js/faker';

// Create a fake department with realistic test data
export function makeFakeDepartment(overrides?: Partial<Insertable<DB['departments']>>) {
    return {
        department_id: faker.string.uuid(),
        department_name: faker.commerce.department(),
        department_code: faker.string.alpha(3).toUpperCase(),
        created_at: faker.date.recent().toISOString(),
        created_by: faker.string.uuid(), // Note: Usually overridden in tests pointing to an inserted auth.users ID
        ...overrides,
    } as Insertable<DB['departments']>;
}

export type CreateTestDepartmentsInDBArgs = {
    dbClient: DbClient;
    values?: Partial<Insertable<DB['departments']>> | Partial<Insertable<DB['departments']>>[];
};

export async function createTestDepartmentsInDB({
    dbClient,
    values,
}: CreateTestDepartmentsInDBArgs) {
    const fakeDepartments = Array.isArray(values)
        ? values.map(makeFakeDepartment)
        : makeFakeDepartment(values);

    const createdDepartments = await dbClient
        .insertInto('departments')
        .values(fakeDepartments)
        .returningAll()
        .execute();

    return createdDepartments;
}
