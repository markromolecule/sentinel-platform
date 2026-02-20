import { type DbClient } from '../../../lib/create-db-client';
import { type DB } from '../../../lib/types';
import { Insertable } from 'kysely';

export function makeFakeStudent(
    overrides?: Partial<Insertable<DB['students']>>,
): Insertable<DB['students']> {
    return {
        student_number: `ST-${Math.floor(Math.random() * 1000000)}`,
        ...overrides,
    };
}

export type CreateTestStudentsInDBArgs = {
    dbClient: DbClient;
    values: Insertable<DB['students']> | Insertable<DB['students']>[];
};

export async function createTestStudentsInDB({ dbClient, values }: CreateTestStudentsInDBArgs) {
    const fakeStudents = Array.isArray(values) ? values : [values];

    const createdStudents = await dbClient
        .insertInto('students')
        .values(fakeStudents)
        .returningAll()
        .execute();

    return createdStudents;
}
