import { type DbClient } from '@sentinel/db';
import { type UpdateInstitutionBody } from '../institution.dto';

export type UpdateInstitutionDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Partial<Omit<UpdateInstitutionBody, 'parentInstitutionId' | 'institutionKind'>> & {
        parent_institution_id?: string | null;
        institution_kind?: 'STANDALONE' | 'PARENT' | 'CHILD';
        updated_by: string;
        updated_at: string | Date;
    };
};

export async function updateInstitutionData({ dbClient, id, values }: UpdateInstitutionDataArgs) {
    const updatedRecord = await dbClient
        .updateTable('institutions')
        .set(values)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateInstitutionDataResponse = Awaited<ReturnType<typeof updateInstitutionData>>;
