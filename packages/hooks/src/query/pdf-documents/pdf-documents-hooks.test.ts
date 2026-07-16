import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnalyticsReportsQuery } from '../analytics/use-analytics-reports-query';
import { useGenerateAnalyticsReportMutation } from '../analytics/use-generate-analytics-report-mutation';
import { useAnalyticsReportDownloadMutation } from '../analytics/use-analytics-report-download-mutation';
import { useRetryAnalyticsReportMutation } from '../analytics/use-retry-analytics-report-mutation';
import { useAnswerKeyExportsQuery } from './use-answer-key-exports-query';
import { useDeleteAnswerKeyExportMutation } from './use-delete-answer-key-export-mutation';
import { usePdfTemplatesQuery } from './use-pdf-templates-query';
import {
    deleteAnswerKeyExport,
    generateAnalyticsReport,
    getAnalyticsReportDownload,
    getAnalyticsReports,
    getAnswerKeyExports,
    getPdfTemplates,
    retryAnalyticsReport,
} from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';

const { mockInvalidateQueries, mockRemoveQueries, mockUseQuery } = vi.hoisted(() => ({
    mockInvalidateQueries: vi.fn(),
    mockRemoveQueries: vi.fn(),
    mockUseQuery: vi.fn((options: any) => {
        if (options.queryFn) {
            void options.queryFn();
        }

        return {
            queryKey: options.queryKey,
            refetchInterval:
                typeof options.refetchInterval === 'function'
                    ? options.refetchInterval({
                          state: {
                              data: {
                                  records: [{ status: 'PENDING' }],
                              },
                          },
                      })
                    : options.refetchInterval,
        };
    }),
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: mockUseQuery,
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
        removeQueries: mockRemoveQueries,
    })),
    useMutation: vi.fn((options: any) => ({
        mutateAsync: async (variables: any) => {
            const data = await options.mutationFn(variables);
            await options.onSuccess?.(data, variables, null);
            return data;
        },
    })),
}));

vi.mock('@sentinel/services', () => ({
    getPdfTemplates: vi.fn(),
    getAnswerKeyExports: vi.fn(),
    getAnalyticsReports: vi.fn(),
    generateAnalyticsReport: vi.fn(),
    getAnalyticsReportDownload: vi.fn(),
    retryAnalyticsReport: vi.fn(),
    deleteAnswerKeyExport: vi.fn(),
}));

vi.mock('@sentinel/shared/constants', () => ({
    ANALYTICS_QUERY_KEYS: {
        all: ['analytics'],
        reports: (
            institutionId?: string | null,
            page?: number,
            limit?: number,
            status?: string,
        ) => ['analytics', 'reports', { institutionId: institutionId ?? '', page, limit, status }],
        pdfTemplates: (institutionId?: string | null, documentKind?: string, status?: string) => [
            'analytics',
            'pdfTemplates',
            { institutionId: institutionId ?? '', documentKind, status },
        ],
        answerKeyExports: (
            institutionId?: string,
            examId?: string,
            page?: number,
            limit?: number,
        ) => [
            'analytics',
            'answerKeyExports',
            { institutionId: institutionId ?? '', examId: examId ?? '', page, limit },
        ],
        answerKeyExportStatus: (exportId?: string | null) => [
            'analytics',
            'answerKeyExportStatus',
            exportId ?? '',
        ],
    },
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('pdf document hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getPdfTemplates as any).mockResolvedValue([]);
        (getAnswerKeyExports as any).mockResolvedValue({
            records: [],
            total_records: 0,
            page: 1,
            limit: 10,
        });
        (getAnalyticsReports as any).mockResolvedValue({
            records: [],
            total_records: 0,
            page: 1,
            limit: 10,
        });
        (generateAnalyticsReport as any).mockResolvedValue({ reportId: 'report-1' });
        (getAnalyticsReportDownload as any).mockResolvedValue({
            success: true,
            downloadUrl: 'https://signed.example/report-1',
        });
        (retryAnalyticsReport as any).mockResolvedValue({
            success: true,
            message: 'queued',
        });
        (deleteAnswerKeyExport as any).mockResolvedValue({
            success: true,
            message: 'deleted',
        });
    });

    it('keeps institution-specific template queries isolated in the query key', () => {
        const query = usePdfTemplatesQuery({
            payload: {
                institutionId: 'institution-1',
                documentKind: 'ANALYTICS_OVERALL',
                status: 'PUBLISHED',
            },
        }) as any;

        expect(query.queryKey).toEqual(
            ANALYTICS_QUERY_KEYS.pdfTemplates('institution-1', 'ANALYTICS_OVERALL', 'PUBLISHED'),
        );
        expect(getPdfTemplates).toHaveBeenCalledWith(
            { mockClient: true },
            {
                institutionId: 'institution-1',
                documentKind: 'ANALYTICS_OVERALL',
                status: 'PUBLISHED',
            },
        );
    });

    it('keeps answer-key list caches separated by institution and exam', () => {
        const query = useAnswerKeyExportsQuery({
            payload: {
                institutionId: 'institution-1',
                examId: 'exam-1',
                page: 2,
                limit: 20,
            },
        }) as any;

        expect(query.queryKey).toEqual(
            ANALYTICS_QUERY_KEYS.answerKeyExports('institution-1', 'exam-1', 2, 20),
        );
    });

    it('polls analytics reports only while the current page has active jobs', () => {
        const query = useAnalyticsReportsQuery({
            payload: {
                institutionId: 'institution-1',
                page: 1,
                limit: 10,
            },
        }) as any;

        expect(query.queryKey).toEqual(
            ANALYTICS_QUERY_KEYS.reports('institution-1', 1, 10, undefined),
        );
        expect(query.refetchInterval).toBe(5000);
    });

    it('invalidates only the targeted analytics report list after queueing a report', async () => {
        const mutation = useGenerateAnalyticsReportMutation();

        await (mutation as any).mutateAsync({
            title: 'Overall Report',
            institutionId: 'institution-1',
            period: 'LAST_30_DAYS',
            timezone: 'Asia/Manila',
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: [...ANALYTICS_QUERY_KEYS.all, 'reports'],
        });
    });

    it('requests a fresh signed analytics download URL on each click', async () => {
        const mutation = useAnalyticsReportDownloadMutation();

        await (mutation as any).mutateAsync('report-1');
        await (mutation as any).mutateAsync('report-1');

        expect(getAnalyticsReportDownload).toHaveBeenCalledTimes(2);
        expect(getAnalyticsReportDownload).toHaveBeenNthCalledWith(
            1,
            { mockClient: true },
            'report-1',
        );
        expect(getAnalyticsReportDownload).toHaveBeenNthCalledWith(
            2,
            { mockClient: true },
            'report-1',
        );
    });

    it('preserves caller callbacks while invalidating targeted retry/delete caches', async () => {
        const onRetrySuccess = vi.fn();
        const onDeleteSuccess = vi.fn();

        const retryMutation = useRetryAnalyticsReportMutation({
            onSuccess: onRetrySuccess,
        });
        const deleteMutation = useDeleteAnswerKeyExportMutation({
            onSuccess: onDeleteSuccess,
        });

        await (retryMutation as any).mutateAsync({
            reportId: 'report-1',
            institutionId: 'institution-1',
            page: 3,
            limit: 25,
            status: 'FAILED',
        });
        await (deleteMutation as any).mutateAsync({
            exportId: 'export-1',
            institutionId: 'institution-1',
            examId: 'exam-1',
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ANALYTICS_QUERY_KEYS.reports('institution-1', 3, 25, 'FAILED'),
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ANALYTICS_QUERY_KEYS.answerKeyExports('institution-1', 'exam-1'),
        });
        expect(mockRemoveQueries).toHaveBeenCalledWith({
            queryKey: ANALYTICS_QUERY_KEYS.answerKeyExportStatus('export-1'),
        });
        expect(onRetrySuccess).toHaveBeenCalledOnce();
        expect(onDeleteSuccess).toHaveBeenCalledOnce();
    });
});
