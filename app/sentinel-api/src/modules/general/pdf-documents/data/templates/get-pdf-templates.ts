import { type DbClient } from '@sentinel/db';
import { type DocumentKind, type TemplateStatus } from '@sentinel/shared/types';

export interface GetPdfTemplatesFilters {
    institutionId?: string | null;
    documentKind?: DocumentKind | null;
    status?: TemplateStatus | null;
}

/**
 * Retrieves PDF templates from the database based on filters.
 * If filters.institutionId is specified and not null, it will return both global and institution-specific templates.
 * 
 * @param dbClient database client
 * @param filters query filters
 * @returns list of templates
 */
export async function getPdfTemplates(dbClient: DbClient, filters: GetPdfTemplatesFilters) {
    let query = dbClient.selectFrom('pdf_templates').selectAll();

    if (filters.documentKind) {
        query = query.where('document_kind', '=', filters.documentKind);
    }

    if (filters.status) {
        query = query.where('status', '=', filters.status);
    }

    if (filters.institutionId !== undefined) {
        if (filters.institutionId === null) {
            query = query.where('institution_id', 'is', null);
        } else {
            const instId = filters.institutionId;
            query = query.where((eb) =>
                eb.or([
                    eb('institution_id', '=', instId),
                    eb('institution_id', 'is', null)
                ])
            );
        }
    }

    return await query.orderBy('created_at', 'desc').execute();
}
