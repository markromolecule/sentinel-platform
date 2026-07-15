import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PdfTemplateExaminationsPage from './page';

vi.mock('@/data', () => ({
    useActivePermissions: () => ({
        hasAnyPermission: () => false,
        hasPermission: () => false,
    }),
    useInstitutionsQuery: () => ({ data: [] }),
    usePdfTemplatesQuery: () => ({ data: [] }),
    useExamsQuery: () => ({ data: [] }),
    useAnswerKeyExportsQuery: () => ({ data: { records: [] } }),
    usePreviewPdfTemplateMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useSavePdfTemplateDraftMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    usePublishPdfTemplateMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useCreateAnswerKeyExportMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAnswerKeyExportDownloadMutation: () => ({ mutateAsync: vi.fn() }),
    useRetryAnswerKeyExportMutation: () => ({ mutateAsync: vi.fn() }),
    useDeleteAnswerKeyExportMutation: () => ({ mutateAsync: vi.fn() }),
}));

describe('PdfTemplateExaminationsPage', () => {
    it('renders a permission denied state without PDF template access', () => {
        render(<PdfTemplateExaminationsPage />);

        expect(screen.getByText(/pdf templates access unavailable/i)).toBeTruthy();
    });
});
