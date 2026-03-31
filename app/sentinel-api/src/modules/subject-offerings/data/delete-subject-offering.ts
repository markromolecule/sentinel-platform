import { type DbClient } from '@sentinel/db';

export async function deleteSubjectOfferingData(dbClient: DbClient, id: string) {
    await dbClient.deleteFrom('subject_offerings').where('subject_offering_id', '=', id).execute();
}
