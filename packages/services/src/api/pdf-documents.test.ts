import { describe, expect, it, vi } from 'vitest';
import {
    createAnswerKeyExport,
    deleteInstitutionPdfBranding,
    getAnswerKeyExports,
    getPdfExportDownload,
    getPdfTemplates,
    previewPdfTemplate,
    publishPdfTemplate,
    retryPdfExport,
    uploadInstitutionPdfBranding,
} from './pdf-documents';

describe('pdf documents api', () => {
    it('builds template query strings from institution and document filters', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            message: 'ok',
            data: [],
        });

        await getPdfTemplates(apiClient as any, {
            institutionId: 'inst-1',
            documentKind: 'ANALYTICS_OVERALL',
            status: 'PUBLISHED',
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/pdf-documents/templates?institutionId=inst-1&documentKind=ANALYTICS_OVERALL&status=PUBLISHED',
        );
    });

    it('posts template previews as json and returns the blob response', async () => {
        const previewBlob = new Blob(['%PDF-1.7']);
        const apiClient = vi.fn().mockResolvedValue(previewBlob);

        const result = await previewPdfTemplate(apiClient as any, {
            institution_id: '11111111-1111-1111-1111-111111111111',
            document_kind: 'ANALYTICS_OVERALL',
            header_config: {
                logo_visible: true,
                logo_placement: 'LEFT',
                logo_max_size_px: 120,
                title_text: 'Preview',
                title_alignment: 'LEFT',
                subtitle_alignment: 'LEFT',
                divider_visible: true,
                divider_color: '#D1D5DB',
                accent_color: '#3B82F6',
                sentinel_logo_visible: true,
            },
            footer_config: {
                text: 'Footer',
                divider_visible: true,
                divider_color: '#E5E7EB',
                page_number_visible: true,
                page_number_format: 'PAGE_X_OF_Y',
            },
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/pdf-documents/templates/preview',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }),
        );
        expect(result).toBe(previewBlob);
    });

    it('uploads branding through multipart form data', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            message: 'ok',
            data: { institution_id: 'inst-1' },
        });
        const file = new File(['svg'], 'logo.svg', { type: 'image/svg+xml' });

        await uploadInstitutionPdfBranding(apiClient as any, 'inst-1', file);

        expect(apiClient).toHaveBeenCalledWith(
            '/pdf-documents/institutions/inst-1/branding',
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            }),
        );
    });

    it('targets answer-key list filters and pagination correctly', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            success: true,
            data: { records: [], total_records: 0, limit: 10, page: 2 },
        });

        await getAnswerKeyExports(apiClient as any, {
            institutionId: 'inst-1',
            examId: 'exam-1',
            page: 2,
            limit: 10,
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/pdf-documents/answer-keys?institutionId=inst-1&examId=exam-1&page=2&limit=10',
        );
    });

    it('posts answer-key creation payloads with json bodies', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            success: true,
            data: { exportId: 'export-1' },
        });

        await createAnswerKeyExport(apiClient as any, {
            exam_id: 'exam-1',
            institution_id: 'inst-1',
            title: 'Answer Key',
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/pdf-documents/answer-keys',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }),
        );
    });

    it('requests fresh signed download URLs and retry endpoints', async () => {
        const apiClient = vi
            .fn()
            .mockResolvedValueOnce({
                success: true,
                downloadUrl: 'https://signed.example/report.pdf',
            })
            .mockResolvedValueOnce({ success: true, message: 'queued' })
            .mockResolvedValueOnce({ message: 'published', template_id: 'template-1', version: 2 })
            .mockResolvedValueOnce({ message: 'deleted' });

        const download = await getPdfExportDownload(apiClient as any, 'export-1');
        const retry = await retryPdfExport(apiClient as any, 'export-1');
        const publish = await publishPdfTemplate(apiClient as any, 'template-1');
        const removeBranding = await deleteInstitutionPdfBranding(apiClient as any, 'inst-1');

        expect(apiClient).toHaveBeenNthCalledWith(1, '/pdf-documents/exports/export-1/download');
        expect(apiClient).toHaveBeenNthCalledWith(
            2,
            '/pdf-documents/exports/export-1/retry',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(apiClient).toHaveBeenNthCalledWith(
            3,
            '/pdf-documents/templates/template-1/publish',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(apiClient).toHaveBeenNthCalledWith(
            4,
            '/pdf-documents/institutions/inst-1/branding',
            expect.objectContaining({ method: 'DELETE' }),
        );
        expect(download.downloadUrl).toContain('signed.example');
        expect(retry.message).toBe('queued');
        expect(publish.version).toBe(2);
        expect(removeBranding.message).toBe('deleted');
    });
});
