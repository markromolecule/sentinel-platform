'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import {
    useActivePermissions,
    useAnalyticsReportDownloadMutation,
    useAnalyticsReportsQuery,
    useGenerateAnalyticsReportMutation,
    useInstitutionsQuery,
    useRetryAnalyticsReportMutation,
    useServerPagination,
} from '@/data';
import { DEFAULT_PRESET, DEFAULT_TIMEZONE } from '../../_constants';
import { ReportPreset } from '../../_types';
import { buildDefaultTitle, validateReportRequest } from '../../_utils';
import { UseReportsAnalyticsResult } from './_types';

/**
 * Custom hook to manage the state, data fetching, mutations, and permissions
 * for the reports analytics page.
 */
export function useReportsAnalytics(): UseReportsAnalyticsResult {
    const { institutionId: scopedInstitutionId, isLoading: isScopeLoading } = useAcademicScope();
    const { hasPermission } = useActivePermissions();

    const canViewReports = hasPermission('reports:view');
    const canGenerateReports = hasPermission('reports:generate');
    const canExportReports = hasPermission('reports:export');

    const { pagination, setPagination } = useServerPagination([scopedInstitutionId]);
    const { data: institutions = [] } = useInstitutionsQuery();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedInstitutionId, setSelectedInstitutionId] = React.useState(
        scopedInstitutionId || '',
    );
    const [title, setTitle] = React.useState(buildDefaultTitle);
    const [preset, setPreset] = React.useState<ReportPreset>(DEFAULT_PRESET);
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
    const [activeDownloadId, setActiveDownloadId] = React.useState<string | null>(null);
    const [activeRetryId, setActiveRetryId] = React.useState<string | null>(null);

    const scopedInstitution = React.useMemo(
        () => institutions.find((inst) => inst.id === scopedInstitutionId) ?? null,
        [institutions, scopedInstitutionId],
    );

    const availableInstitutions = React.useMemo(() => {
        if (!scopedInstitutionId) return institutions;
        if (!scopedInstitution) return institutions.filter((inst) => inst.id === scopedInstitutionId);
        if (scopedInstitution.institutionKind === 'PARENT') {
            return institutions.filter(
                (inst) =>
                    inst.id === scopedInstitutionId ||
                    inst.parentInstitutionId === scopedInstitutionId,
            );
        }
        return institutions.filter((inst) => inst.id === scopedInstitutionId);
    }, [institutions, scopedInstitution, scopedInstitutionId]);

    const isInstitutionLocked = Boolean(
        scopedInstitutionId &&
            (!scopedInstitution || scopedInstitution.institutionKind !== 'PARENT'),
    );

    React.useEffect(() => {
        if (isScopeLoading) return;
        if (isInstitutionLocked && scopedInstitutionId) {
            setSelectedInstitutionId(scopedInstitutionId);
            return;
        }
        setSelectedInstitutionId((current) =>
            current && availableInstitutions.some((inst) => inst.id === current)
                ? current
                : availableInstitutions[0]?.id ?? '',
        );
    }, [availableInstitutions, isInstitutionLocked, isScopeLoading, scopedInstitutionId]);

    const reportsInstitutionId = isInstitutionLocked ? scopedInstitutionId || undefined : undefined;

    const reportsQuery = useAnalyticsReportsQuery({
        payload: {
            institutionId: reportsInstitutionId,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
        },
        enabled: canViewReports && !isScopeLoading,
    });

    const generateReportMutation = useGenerateAnalyticsReportMutation({
        onSuccess: async () => {
            setIsDialogOpen(false);
            setValidationErrors([]);
            setTitle(buildDefaultTitle());
            setPreset(DEFAULT_PRESET);
            setStartDate('');
            setEndDate('');
            await reportsQuery.refetch();
            toast.success('Report queued successfully.');
        },
    });

    const downloadReportMutation = useAnalyticsReportDownloadMutation();
    const retryReportMutation = useRetryAnalyticsReportMutation();

    const institutionNameById = React.useMemo(
        () =>
            institutions.reduce<Record<string, string>>((acc, inst) => {
                acc[inst.id] = inst.name;
                return acc;
            }, {}),
        [institutions],
    );

    const pageCount = Math.max(
        1,
        Math.ceil((reportsQuery.data?.total_records ?? 0) / pagination.pageSize),
    );

    const handleSubmit = async () => {
        const errors = validateReportRequest({
            institutionId: selectedInstitutionId,
            title,
            preset,
            startDate,
            endDate,
        });

        setValidationErrors(errors);
        if (errors.length > 0) return;

        await generateReportMutation.mutateAsync({
            institutionId: selectedInstitutionId,
            title: title.trim(),
            period: preset,
            startDate: preset === 'CUSTOM' ? startDate : undefined,
            endDate: preset === 'CUSTOM' ? endDate : undefined,
            timezone: DEFAULT_TIMEZONE,
        });
    };

    const handleDownload = async (reportId: string) => {
        const loadingToastId = toast.loading('Preparing the PDF download...');
        try {
            setActiveDownloadId(reportId);
            const response = await downloadReportMutation.mutateAsync(reportId);
            toast.success('PDF download is ready.', { id: loadingToastId });
            window.open(response.downloadUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to prepare the report download.';
            toast.error(message, { id: loadingToastId });
        } finally {
            setActiveDownloadId(null);
        }
    };

    const handleRetry = async (reportId: string) => {
        try {
            setActiveRetryId(reportId);
            await retryReportMutation.mutateAsync({
                reportId,
                institutionId: reportsInstitutionId ?? null,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            });
            toast.success('Report retry queued');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to queue the report retry.';
            toast.error(message);
        } finally {
            setActiveRetryId(null);
        }
    };

    return {
        canViewReports,
        canGenerateReports,
        canExportReports,
        isScopeLoading,
        isReportsLoading: reportsQuery.isLoading,
        isDialogOpen,
        setIsDialogOpen,
        selectedInstitutionId,
        setSelectedInstitutionId,
        title,
        setTitle,
        preset,
        setPreset,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        validationErrors,
        setValidationErrors,
        activeDownloadId,
        activeRetryId,
        reports: reportsQuery.data?.records ?? [],
        pagination,
        setPagination,
        pageCount,
        institutions,
        availableInstitutions,
        isInstitutionLocked,
        scopedInstitutionId,
        institutionNameById,
        handleSubmit,
        handleDownload,
        handleRetry,
        isGeneratePending: generateReportMutation.isPending,
    };
}
