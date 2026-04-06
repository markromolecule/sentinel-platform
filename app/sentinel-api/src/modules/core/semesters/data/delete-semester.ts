import { type DbClient } from '@sentinel/db';

// Type for deleteSemesterData function arguments
export type DeleteSemesterDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteSemesterData({ dbClient, id, institutionId }: DeleteSemesterDataArgs) {
    // Delete a semester record from the terms table
    let query = dbClient.deleteFrom('terms').where('term_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const deletedRecord = await query.returningAll().executeTakeFirstOrThrow();

    return deletedRecord;
}

export type DeleteSemesterDataResponse = Awaited<ReturnType<typeof deleteSemesterData>>;
