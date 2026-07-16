import { type DbClient } from '@sentinel/db';
import { type DocumentKind, type HeaderConfig, type FooterConfig } from '@sentinel/shared/types';
import { randomUUID } from 'crypto';

export interface UpsertPdfTemplateDraftInput {
    institutionId: string | null;
    documentKind: DocumentKind;
    headerConfig: HeaderConfig;
    footerConfig: FooterConfig;
    userId: string;
}

/**
 * Creates or updates the singular DRAFT template for the given scope and document kind.
 * 
 * @param dbClient database client
 * @param input upsert data
 * @returns template ID
 */
export async function upsertPdfTemplateDraft(
    dbClient: DbClient,
    input: UpsertPdfTemplateDraftInput
): Promise<string> {
    const { institutionId, documentKind, headerConfig, footerConfig, userId } = input;

    // Search for existing DRAFT template of the same scope and kind
    let query = dbClient
        .selectFrom('pdf_templates')
        .select(['template_id'])
        .where('document_kind', '=', documentKind)
        .where('status', '=', 'DRAFT');

    if (institutionId === null) {
        query = query.where('institution_id', 'is', null);
    } else {
        query = query.where('institution_id', '=', institutionId);
    }

    const existingDraft = await query.executeTakeFirst();

    if (existingDraft) {
        // Update existing draft
        await dbClient
            .updateTable('pdf_templates')
            .set({
                header_config: JSON.stringify(headerConfig) as any,
                footer_config: JSON.stringify(footerConfig) as any,
                updated_by: userId,
                updated_at: new Date(),
            })
            .where('template_id', '=', existingDraft.template_id)
            .execute();

        return existingDraft.template_id;
    } else {
        // Create a new draft
        const templateId = randomUUID();
        await dbClient
            .insertInto('pdf_templates')
            .values({
                template_id: templateId,
                institution_id: institutionId,
                document_kind: documentKind,
                version: 1, // default version
                status: 'DRAFT',
                header_config: JSON.stringify(headerConfig) as any,
                footer_config: JSON.stringify(footerConfig) as any,
                created_by: userId,
                updated_by: userId,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .execute();

        return templateId;
    }
}
