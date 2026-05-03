import { type DbClient } from '@sentinel/db';
import { type CreateInstitutionBody } from '../institution.dto';

export type CreateInstitutionDataArgs = {
    dbClient: DbClient;
    values: Omit<CreateInstitutionBody, 'parentInstitutionId' | 'institutionKind'> & {
        parent_institution_id?: string | null;
        institution_kind?: 'STANDALONE' | 'PARENT' | 'CHILD';
        created_by: string;
    };
};

export async function createInstitutionData({ dbClient, values }: CreateInstitutionDataArgs) {
    const createdRecord = await dbClient
        .insertInto('institutions')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
    return createdRecord;
}

export type CreateInstitutionDataResponse = Awaited<ReturnType<typeof createInstitutionData>>;
