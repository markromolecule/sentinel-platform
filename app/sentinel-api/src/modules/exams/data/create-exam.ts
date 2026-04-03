import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateExamDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['exams']>;
};

export async function createExamData({ dbClient, values }: CreateExamDataArgs) {
    return await dbClient
        .insertInto('exams')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
}
