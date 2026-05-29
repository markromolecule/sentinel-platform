import { type DbClient } from '@sentinel/db';

/**
 * Resolves all related institution IDs (parent and children) for a given active institution ID
 * to support complete parent-child scoping across activities, logs, and notifications.
 *
 * @param dbClient Database client
 * @param activeInstitutionId Active institution ID
 * @returns Array of related institution IDs
 */
export async function resolveRelatedInstitutions(
    dbClient: DbClient,
    activeInstitutionId: string | null | undefined,
): Promise<string[]> {
    if (!activeInstitutionId) {
        return [];
    }

    const institution = await dbClient
        .selectFrom('institutions')
        .select(['id', 'parent_institution_id as parentId', 'institution_kind as kind'])
        .where('id', '=', activeInstitutionId)
        .executeTakeFirst();

    if (!institution) {
        return [activeInstitutionId];
    }

    if (institution.kind === 'CHILD' && institution.parentId) {
        // For child branches, return the branch itself and its parent institution
        return [activeInstitutionId, institution.parentId];
    }

    if (institution.kind === 'PARENT') {
        // For parent schools, return the parent itself and all its child branch campuses
        const branches = await dbClient
            .selectFrom('institutions')
            .select('id')
            .where('parent_institution_id', '=', activeInstitutionId)
            .execute();

        return [activeInstitutionId, ...branches.map((b) => b.id)];
    }

    return [activeInstitutionId];
}
