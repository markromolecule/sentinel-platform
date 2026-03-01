import { type DbClient } from '@/lib/create-db-client';
import { type DB } from '@/lib/types';
import { type Insertable } from 'kysely';
import { faker } from '@faker-js/faker';

// Create a fake user with realistic test data
export function makeFakeUser(overrides?: Partial<Insertable<DB['auth.users']>>) {
    return {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        role: 'authenticated',
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        ...overrides,
    } as Insertable<DB['auth.users']>;
}

export type CreateTestUsersInDBArgs = {
    dbClient: DbClient;
    values?: Partial<Insertable<DB['auth.users']>> | Partial<Insertable<DB['auth.users']>>[];
};

export async function createTestUsersInDB({ dbClient, values }: CreateTestUsersInDBArgs) {
    const fakeUsers = Array.isArray(values) ? values.map(makeFakeUser) : makeFakeUser(values);

    const createdUsers = await dbClient
        .insertInto('auth.users')
        .values(fakeUsers)
        .returningAll()
        .execute();

    return createdUsers;
}
