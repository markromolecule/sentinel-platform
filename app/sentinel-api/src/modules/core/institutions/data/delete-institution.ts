import { type DbClient } from '@sentinel/db';

export type DeleteInstitutionDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteInstitutionData({ dbClient, id }: DeleteInstitutionDataArgs) {
    const deletedRecord = await dbClient
        .deleteFrom('institutions')
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return deletedRecord;
}

export type DeleteInstitutionDataResponse = Awaited<ReturnType<typeof deleteInstitutionData>>;
