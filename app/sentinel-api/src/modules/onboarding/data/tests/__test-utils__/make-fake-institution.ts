import { type DbClient } from '@sentinel/db';
import { type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';
import { faker } from '@faker-js/faker';

// Create a fake institution with realistic test data
export function makeFakeInstitution(overrides?: Partial<Insertable<DB['institutions']>>) {
    return {
        id: faker.string.uuid(),
        name: faker.company.name() + ' University',
        code: faker.string.alpha(3).toUpperCase(),
        created_at: faker.date.recent().toISOString(),
        ...overrides,
    } as Insertable<DB['institutions']>;
}

export type CreateTestInstitutionsInDBArgs = {
    dbClient: DbClient;
    values?: Partial<Insertable<DB['institutions']>> | Partial<Insertable<DB['institutions']>>[];
};

export async function createTestInstitutionsInDB({
    dbClient,
    values,
}: CreateTestInstitutionsInDBArgs) {
    const fakeInstitutions = Array.isArray(values)
        ? values.map(makeFakeInstitution)
        : makeFakeInstitution(values);

    const createdInstitutions = await dbClient
        .insertInto('institutions')
        .values(fakeInstitutions)
        .returningAll()
        .execute();

    return createdInstitutions;
}
