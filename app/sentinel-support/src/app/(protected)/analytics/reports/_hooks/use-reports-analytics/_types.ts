import { type PaginationState } from '@tanstack/react-table';
import type { Institution } from '@sentinel/shared/types';
import type { AnalyticsReport } from '@/data';
import { ReportPreset } from '../../_types';

export interface UseReportsAnalyticsResult {
    // Permissions
    canViewReports: boolean;
    canGenerateReports: boolean;
    canExportReports: boolean;

    // Loading states
    isScopeLoading: boolean;
    isReportsLoading: boolean;

    // State Variables
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    selectedInstitutionId: string;
    setSelectedInstitutionId: (id: string) => void;
    title: string;
    setTitle: (title: string) => void;
    preset: ReportPreset;
    setPreset: (preset: ReportPreset) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    validationErrors: string[];
    setValidationErrors: (errors: string[]) => void;
    activeDownloadId: string | null;
    activeRetryId: string | null;

    // Query & Pagination
    reports: AnalyticsReport[];
    pagination: PaginationState;
    setPagination: (pagination: PaginationState) => void;
    pageCount: number;
    institutions: Institution[];
    availableInstitutions: Institution[];
    isInstitutionLocked: boolean;
    scopedInstitutionId: string | null;
    institutionNameById: Record<string, string>;

    // Actions
    handleSubmit: () => Promise<void>;
    handleDownload: (reportId: string) => Promise<void>;
    handleRetry: (reportId: string) => Promise<void>;
    isGeneratePending: boolean;
}
