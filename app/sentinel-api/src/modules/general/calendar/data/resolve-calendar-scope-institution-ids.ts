import { type DbClient } from '@sentinel/db';

/**
 * Resolves calendar visibility across the active institution hierarchy.
 * The current scope includes the active institution, its direct parent,
 * and any direct child institutions.
 */
export async function resolveCalendarScopeInstitutionIds(
    dbClient: DbClient,
    institutionId: string,
) {
    if (!institutionId) {
        return [];
    }

    const institutionIds = new Set<string>([institutionId]);

    const institution = await dbClient
        .selectFrom('institutions')
        .select(['parent_institution_id'])
        .where('id', '=', institutionId)
        .executeTakeFirst();

    if (institution?.parent_institution_id) {
        institutionIds.add(institution.parent_institution_id);
    }

    const childInstitutions = await dbClient
        .selectFrom('institutions')
        .select('id')
        .where('parent_institution_id', '=', institutionId)
        .execute();

    for (const childInstitution of childInstitutions) {
        institutionIds.add(childInstitution.id);
    }

    return Array.from(institutionIds);
}
