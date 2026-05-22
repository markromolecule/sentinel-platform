import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateBulkDepartmentsDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['departments']>[];
};

/**
 * Inserts multiple department records into the departments table.
 */
export async function createBulkDepartmentsData({
    dbClient,
    values,
}: CreateBulkDepartmentsDataArgs) {
    if (values.length === 0) {
        return [];
    }

    const createdRecords = await dbClient
        .insertInto('departments')
        .values(
            values.map((v) => ({
                ...v,
                created_at: v.created_at ?? new Date(),
            })),
        )
        .returningAll()
        .execute();

    return createdRecords;
}

export type CreateBulkDepartmentsDataResponse = Awaited<
    ReturnType<typeof createBulkDepartmentsData>
>;
