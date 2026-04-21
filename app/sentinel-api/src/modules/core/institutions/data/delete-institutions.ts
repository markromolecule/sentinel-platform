import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type DeleteInstitutionsDataArgs = {
    dbClient: DbClient;
    ids: string[];
};

export async function deleteInstitutionsData({ dbClient, ids }: DeleteInstitutionsDataArgs) {
    if (!ids || ids.length === 0) {
        throw new HTTPException(400, { message: 'No institution IDs provided' });
    }

    const deletedRecords = await dbClient
        .deleteFrom('institutions')
        .where('id', 'in', ids)
        .returning('id')
        .execute();

    if (deletedRecords.length === 0) {
        throw new HTTPException(404, { message: 'Institutions not found or already deleted' });
    }

    return deletedRecords;
}
