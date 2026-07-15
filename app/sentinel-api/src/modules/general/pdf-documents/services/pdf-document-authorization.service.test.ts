import { describe, expect, it } from 'vitest';
import {
    assertOverallReportTemplateScope,
    requirePdfDocumentAccess,
} from './pdf-document-authorization.service';

function createDbClient(institutions: Array<{ id: string; institution_kind: string }>) {
    return {
        selectFrom: () => ({
            select: () => ({
                where: (_column: string, _op: string, institutionId: string) => ({
                    executeTakeFirst: async () =>
                        institutions.find((institution) => institution.id === institutionId) ??
                        null,
                }),
            }),
        }),
    } as any;
}

describe('pdf-document-authorization.service', () => {
    it('allows support callers with one matching permission', () => {
        expect(() =>
            requirePdfDocumentAccess({
                role: 'support',
                activePermissionKeys: ['pdf_templates:view'],
                requiredPermissions: ['pdf_templates:view', 'pdf_templates:manage'],
            }),
        ).not.toThrow();
    });

    it('rejects non-support callers', () => {
        expect(() =>
            requirePdfDocumentAccess({
                role: 'admin',
                activePermissionKeys: ['pdf_templates:view'],
                requiredPermissions: 'pdf_templates:view',
            }),
        ).toThrowError(/Support role is required/);
    });

    it('rejects support callers without the required permission', () => {
        expect(() =>
            requirePdfDocumentAccess({
                role: 'support',
                activePermissionKeys: ['institutions:view'],
                requiredPermissions: 'pdf_templates:manage',
            }),
        ).toThrowError(/Missing required PDF document permission/);
    });

    it('allows the global overall-report scope', async () => {
        await expect(
            assertOverallReportTemplateScope(createDbClient([]), null),
        ).resolves.toBeUndefined();
    });

    it('allows parent institutions for overall-report scope', async () => {
        await expect(
            assertOverallReportTemplateScope(
                createDbClient([{ id: 'parent-id', institution_kind: 'PARENT' }]),
                'parent-id',
            ),
        ).resolves.toBeUndefined();
    });

    it('rejects child and standalone institutions for overall-report scope', async () => {
        await expect(
            assertOverallReportTemplateScope(
                createDbClient([{ id: 'child-id', institution_kind: 'CHILD' }]),
                'child-id',
            ),
        ).rejects.toMatchObject({ status: 400 });

        await expect(
            assertOverallReportTemplateScope(
                createDbClient([{ id: 'standalone-id', institution_kind: 'STANDALONE' }]),
                'standalone-id',
            ),
        ).rejects.toMatchObject({ status: 400 });
    });

    it('rejects nonexistent institutions for overall-report scope', async () => {
        await expect(
            assertOverallReportTemplateScope(createDbClient([]), 'missing-id'),
        ).rejects.toMatchObject({ status: 400 });
    });
});
