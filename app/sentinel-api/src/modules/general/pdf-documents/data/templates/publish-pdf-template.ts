import { executeTransaction, type DbClient } from '@sentinel/db';

/**
 * Publishes a DRAFT template by:
 * 1. Resolving the next version number.
 * 2. Archiving any existing PUBLISHED template for the same scope and kind.
 * 3. Updating the DRAFT template's status to PUBLISHED with version and publisher metadata.
 * All operations run transactionally.
 *
 * @param dbClient database client
 * @param templateId template ID to publish
 * @param userId publishing user ID
 * @returns published template ID and new version number
 */
export async function publishPdfTemplate(
    dbClient: DbClient,
    templateId: string,
    userId: string,
): Promise<{ templateId: string; version: number }> {
    return await executeTransaction(async (trx) => {
        // Fetch the draft template
        const draft = await trx
            .selectFrom('pdf_templates')
            .selectAll()
            .where('template_id', '=', templateId)
            .executeTakeFirst();

        if (!draft) {
            throw new Error('Draft template not found');
        }

        if (draft.status !== 'DRAFT') {
            throw new Error(`Template is not in DRAFT status (current status: ${draft.status})`);
        }

        // Get the latest version number for the same scope and kind
        let versionQuery = trx
            .selectFrom('pdf_templates')
            .select((eb) => eb.fn.max('version').as('maxVersion'))
            .where('document_kind', '=', draft.document_kind);

        if (draft.institution_id === null) {
            versionQuery = versionQuery.where('institution_id', 'is', null);
        } else {
            versionQuery = versionQuery.where('institution_id', '=', draft.institution_id);
        }

        const versionResult = await versionQuery.executeTakeFirst();
        const latestVersion = versionResult?.maxVersion ? Number(versionResult.maxVersion) : 0;
        const newVersion = latestVersion + 1;

        // Archive any currently published templates of the same scope and kind
        let archiveQuery = trx
            .updateTable('pdf_templates')
            .set({
                status: 'ARCHIVED',
                updated_at: new Date(),
                updated_by: userId,
            })
            .where('document_kind', '=', draft.document_kind)
            .where('status', '=', 'PUBLISHED');

        if (draft.institution_id === null) {
            archiveQuery = archiveQuery.where('institution_id', 'is', null);
        } else {
            archiveQuery = archiveQuery.where('institution_id', '=', draft.institution_id);
        }

        await archiveQuery.execute();

        // Publish the target template
        await trx
            .updateTable('pdf_templates')
            .set({
                status: 'PUBLISHED',
                version: newVersion,
                published_by: userId,
                published_at: new Date(),
                updated_by: userId,
                updated_at: new Date(),
            })
            .where('template_id', '=', templateId)
            .execute();

        return {
            templateId,
            version: newVersion,
        };
    });
}
