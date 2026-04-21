import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type DeleteSemestersDataArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
};

export async function deleteSemestersData({
    dbClient,
    ids,
    institutionId,
}: DeleteSemestersDataArgs) {
    if (!ids || ids.length === 0) {
        throw new HTTPException(400, { message: 'No semester IDs provided' });
    }

    let query = dbClient.deleteFrom('terms').where('term_id', 'in', ids);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const deletedRecords = await query.returning('term_id').execute();

    if (deletedRecords.length === 0) {
        throw new HTTPException(404, { message: 'Semesters not found or already deleted' });
    }

    return deletedRecords;
}
