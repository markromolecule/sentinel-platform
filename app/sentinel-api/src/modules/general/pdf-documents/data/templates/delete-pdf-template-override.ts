import { type DbClient } from '@sentinel/db';
import { type DocumentKind } from '@sentinel/shared/types';

/**
 * Deletes the DRAFT template override for the given institution and document kind.
 * 
 * @param dbClient database client
 * @param institutionId institution ID
 * @param documentKind document kind
 * @returns boolean indicating if a draft override was deleted
 */
export async function deletePdfTemplateOverride(
    dbClient: DbClient,
    institutionId: string,
    documentKind: DocumentKind
): Promise<boolean> {
    const result = await dbClient
        .deleteFrom('pdf_templates')
        .where('institution_id', '=', institutionId)
        .where('document_kind', '=', documentKind)
        .where('status', '=', 'DRAFT')
        .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
}
