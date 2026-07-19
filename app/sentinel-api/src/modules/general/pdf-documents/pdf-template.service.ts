import { type DbClient } from '@sentinel/db';
import {
    type DocumentKind,
    type HeaderConfig,
    type FooterConfig,
    type TemplateStatus,
} from '@sentinel/shared/types';
import { getPdfTemplates } from './data/templates/get-pdf-templates';
import {
    upsertPdfTemplateDraft,
    UpsertPdfTemplateDraftInput,
} from './data/templates/upsert-pdf-template-draft';
import { publishPdfTemplate } from './data/templates/publish-pdf-template';
import { deletePdfTemplateOverride } from './data/templates/delete-pdf-template-override';
import { resolvePdfTemplate } from './services/resolve-pdf-template.service';

export class PdfTemplateService {
    /**
     * Lists templates by filters.
     */
    static async getTemplates(
        dbClient: DbClient,
        filters: {
            institutionId?: string | null;
            documentKind?: DocumentKind | null;
            status?: TemplateStatus | null;
        },
    ) {
        return await getPdfTemplates(dbClient, filters);
    }

    /**
     * Upserts a draft template.
     */
    static async upsertDraft(dbClient: DbClient, input: UpsertPdfTemplateDraftInput) {
        return await upsertPdfTemplateDraft(dbClient, input);
    }

    /**
     * Publishes a draft template.
     */
    static async publishTemplate(dbClient: DbClient, templateId: string, userId: string) {
        return await publishPdfTemplate(dbClient, templateId, userId);
    }

    /**
     * Deletes a draft template override for a given institution and kind.
     */
    static async deleteDraftOverride(
        dbClient: DbClient,
        institutionId: string,
        documentKind: DocumentKind,
    ) {
        return await deletePdfTemplateOverride(dbClient, institutionId, documentKind);
    }

    /**
     * Resolves the active template applying override/global/built-in precedence.
     */
    static async resolveActiveTemplate(
        dbClient: DbClient,
        institutionId: string | null,
        documentKind: DocumentKind,
    ) {
        return await resolvePdfTemplate(dbClient, institutionId, documentKind);
    }
}
