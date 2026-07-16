'use client';

import * as React from 'react';
import { Button, PermissionDeniedState, Skeleton } from '@sentinel/ui';
import { FileBarChart, Loader2 } from 'lucide-react';
import { AnalyticsPageShell } from '../_components/layout';
import { AnalyticsReportsList } from '@/app/(protected)/analytics/_components';
import { QueueReportDialog } from './_components/queue-report-dialog';
import { useReportsAnalytics } from './_hooks/use-reports-analytics';

export default function ReportsAnalyticsPage() {
    const {
        canViewReports,
        canGenerateReports,
        canExportReports,
        isScopeLoading,
        isReportsLoading,
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
        activeDownloadId,
        activeRetryId,
        reports,
        pagination,
        setPagination,
        pageCount,
        availableInstitutions,
        isInstitutionLocked,
        scopedInstitutionId,
        institutionNameById,
        handleSubmit,
        handleDownload,
        handleRetry,
        isGeneratePending,
    } = useReportsAnalytics();

    if (!canViewReports) {
        return <PermissionDeniedState resourceName="reports" />;
    }

    return (
        <AnalyticsPageShell
            title="Generated Reports"
            description="Queue overall analytics PDFs, follow their lifecycle, and request a fresh signed download only when you need it."
            actions={
                <Button
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    disabled={!canGenerateReports || isGeneratePending}
                    onClick={() => setIsDialogOpen(true)}
                >
                    {isGeneratePending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileBarChart className="mr-2 h-4 w-4" />
                    )}
                    {isGeneratePending ? 'Queueing report...' : 'Generate Overall Report'}
                </Button>
            }
        >
            <div className="space-y-6">
                {isScopeLoading || isReportsLoading ? (
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                ) : (
                    <AnalyticsReportsList
                        reports={reports}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        institutionNameById={institutionNameById}
                        activeDownloadId={activeDownloadId}
                        activeRetryId={activeRetryId}
                        canExportReports={canExportReports}
                        canRetryReports={canGenerateReports}
                        onDownload={handleDownload}
                        onRetry={handleRetry}
                    />
                )}
            </div>

            <QueueReportDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={title}
                onTitleChange={setTitle}
                selectedInstitutionId={selectedInstitutionId}
                onInstitutionChange={setSelectedInstitutionId}
                preset={preset}
                onPresetChange={setPreset}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                validationErrors={validationErrors}
                availableInstitutions={availableInstitutions}
                isInstitutionLocked={isInstitutionLocked}
                scopedInstitutionId={scopedInstitutionId}
                onSubmit={handleSubmit}
                isPending={isGeneratePending}
            />
        </AnalyticsPageShell>
    );
}
