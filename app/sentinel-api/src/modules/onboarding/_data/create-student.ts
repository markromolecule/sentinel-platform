import { DbClient } from '../../../lib/create-db-client';
import { Insertable } from 'kysely';
import { DB } from '../../../lib/types';

export type CreateStudentDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['students']>;
};

export async function createStudentData({ dbClient, values }: CreateStudentDataArgs) {
    const createdRecord = await dbClient
        .insertInto('students')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();

    return createdRecord;
}

export type CreateStudentDataResponse = Awaited<ReturnType<typeof createStudentData>>;
