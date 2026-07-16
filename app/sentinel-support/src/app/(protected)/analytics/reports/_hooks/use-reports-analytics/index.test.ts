import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReportsAnalytics } from './index';
import {
    useActivePermissions,
    useInstitutionsQuery,
    useAnalyticsReportsQuery,
    useGenerateAnalyticsReportMutation,
    useAnalyticsReportDownloadMutation,
    useRetryAnalyticsReportMutation,
    useServerPagination,
} from '@/data';

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        institutionId: 'inst-123',
        isLoading: false,
    }),
}));

vi.mock('@/data', () => ({
    useActivePermissions: vi.fn(),
    useInstitutionsQuery: vi.fn(),
    useAnalyticsReportsQuery: vi.fn(),
    useGenerateAnalyticsReportMutation: vi.fn(),
    useAnalyticsReportDownloadMutation: vi.fn(),
    useRetryAnalyticsReportMutation: vi.fn(),
    useServerPagination: vi.fn(),
}));

describe('useReportsAnalytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useActivePermissions as any).mockReturnValue({
            hasPermission: vi.fn(() => true),
        });
        (useInstitutionsQuery as any).mockReturnValue({
            data: [{ id: 'inst-123', name: 'Sentinel University', institutionKind: 'PARENT' }],
        });
        (useAnalyticsReportsQuery as any).mockReturnValue({
            data: { records: [], total_records: 0 },
            isLoading: false,
        });
        (useGenerateAnalyticsReportMutation as any).mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        });
        (useAnalyticsReportDownloadMutation as any).mockReturnValue({
            mutateAsync: vi.fn(),
        });
        (useRetryAnalyticsReportMutation as any).mockReturnValue({
            mutateAsync: vi.fn(),
        });
        (useServerPagination as any).mockReturnValue({
            pagination: { pageIndex: 0, pageSize: 10 },
            setPagination: vi.fn(),
        });
    });

    it('initializes default state and permissions', () => {
        const { result } = renderHook(() => useReportsAnalytics());
        expect(result.current.canViewReports).toBe(true);
        expect(result.current.canGenerateReports).toBe(true);
        expect(result.current.canExportReports).toBe(true);
        expect(result.current.isDialogOpen).toBe(false);
        expect(result.current.title).toContain('Overall Analytics Report - ');
        expect(result.current.preset).toBe('LAST_30_DAYS');
    });

    it('opens and closes the dialog', () => {
        const { result } = renderHook(() => useReportsAnalytics());
        expect(result.current.isDialogOpen).toBe(false);
        act(() => {
            result.current.setIsDialogOpen(true);
        });
        expect(result.current.isDialogOpen).toBe(true);
    });
});
