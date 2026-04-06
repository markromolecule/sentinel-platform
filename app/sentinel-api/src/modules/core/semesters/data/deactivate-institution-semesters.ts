import { type DbClient } from '@sentinel/db';

export type DeactivateInstitutionSemestersDataArgs = {
    dbClient: DbClient;
    institutionId: string;
    excludeTermId?: string;
};

export async function deactivateInstitutionSemestersData({
    dbClient,
    institutionId,
    excludeTermId,
}: DeactivateInstitutionSemestersDataArgs) {
    let query = dbClient
        .updateTable('terms')
        .set({ is_active: false })
        .where('institution_id', '=', institutionId);

    if (excludeTermId) {
        query = query.where('term_id', '!=', excludeTermId);
    }

    await query.execute();
}
