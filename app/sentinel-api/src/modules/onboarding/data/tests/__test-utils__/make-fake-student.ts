import { type DbClient } from '../../../../../lib/create-db-client';
import { type DB } from '../../../../../lib/types';
import { type Insertable } from 'kysely';
import { faker } from '@faker-js/faker';

// Create a fake student with realistic test data
export function makeFakeStudent(overrides?: Partial<Insertable<DB['students']>>) {
    return {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(), // Foreign key from auth.users (usually overridden)
        student_number: faker.string.numeric(8),
        institution_id: faker.string.uuid(), // Foreign key from institutions (usually overridden)
        department_id: faker.string.uuid(), // Foreign key from departments (usually overridden)
        created_at: faker.date.recent().toISOString(),
        ...overrides,
    } as Insertable<DB['students']>;
}

export type CreateTestStudentsInDBArgs = {
    dbClient: DbClient;
    values?: Partial<Insertable<DB['students']>> | Partial<Insertable<DB['students']>>[];
};

export async function createTestStudentsInDB({ dbClient, values }: CreateTestStudentsInDBArgs) {
    const fakeStudents = Array.isArray(values)
        ? values.map(makeFakeStudent)
        : makeFakeStudent(values);

    const createdStudents = await dbClient
        .insertInto('students')
        .values(fakeStudents)
        .returningAll()
        .execute();

    return createdStudents;
}
