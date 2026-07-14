'use client';

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button, Spinner, Separator, PageHeader, Skeleton } from '@sentinel/ui';
import { ExamCardsGrid } from './exam-cards-grid';
import { ExamCombobox } from './exam-combobox';
import { IncidentTable } from './incident-table';
import { IncidentDrawer } from './incident-drawer';
import { BulkActions } from './bulk-actions';
import { ExamsPageShell } from '../../_components/layout';
import { ExamsPagination } from '@/features/exams/_components/views/exams-pagination';
import { useExamIncidentLogs } from '../_hooks/use-exam-incident-logs';

export function ExamIncidentLogsContent({ initialExamId }: { initialExamId?: string }) {
    const {
        examId,
        search,
        setSearch,
        catalogSearch,
        setCatalogSearch,
        catalogPage,
        setCatalogPage,
        catalogPageSize,
        catalogPageCount,
        catalogTotalCount,
        columnFilters,
        setColumnFilters,
        groupMode,
        setGroupMode,
        selectedIds,
        setSelectedIds,
        selectedIncident,
        setSelectedIncident,
        drawerOpen,
        setDrawerOpen,
        reportableExams,
        selectorExams,
        displayIncidents,
        sections,
        isCatalogLoading,
        isIncidentsLoading,
        isFetching,
        isError,
        hasNextPage,
        isFetchingNextPage,
        isReviewing,
        refetch,
        fetchNextPage,
        handleExamChange,
        handleConfirmIncident,
        handleDismissIncident,
        handleConfirmBulk,
        handleDismissBulk,
    } = useExamIncidentLogs(initialExamId);

    return (
        <ExamsPageShell className="min-h-full">
            {examId ? (
                <div className="space-y-2">
                    <PageHeader
                        title="Incident Logs & Analytics"
                        description="Review, confirm, or dismiss proctoring telemetry alerts recorded during examinations."
                        className="px-0"
                    >
                        <div className="flex items-center gap-3">
                            <ExamCombobox
                                exams={selectorExams || []}
                                selectedExamId={examId}
                                onSelectExam={handleExamChange}
                                searchValue={catalogSearch}
                                onSearchChange={setCatalogSearch}
                            />
                            <Button
                                variant="outline"
                                onClick={() => void refetch()}
                                disabled={isFetching}
                                className="h-10 gap-2"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                                />
                                Refresh Logs
                            </Button>
                        </div>
                    </PageHeader>
                    <Separator />
                </div>
            ) : null}

            {!examId ? (
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 self-center">
                    {isCatalogLoading ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-tight">
                                        Incident Logs & Analytics
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Review, confirm, or dismiss proctoring telemetry alerts recorded during
                                        examinations.
                                    </p>
                                </div>
                                <div className="relative w-full md:w-72">
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="border border-border/70 flex flex-col gap-4 rounded-xl p-6 shadow-sm bg-card"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-6 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                            <Skeleton className="h-6 w-12 rounded-full" />
                                        </div>
                                        <div className="space-y-3 py-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-5/6" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                        <Skeleton className="mt-2 h-10 w-full rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <ExamCardsGrid
                                exams={reportableExams || []}
                                onSelectExam={handleExamChange}
                                searchValue={catalogSearch}
                                onSearchChange={setCatalogSearch}
                            />
                            {reportableExams.length > 0 ? (
                                <ExamsPagination
                                    page={catalogPage}
                                    pageCount={catalogPageCount}
                                    pageSize={catalogPageSize}
                                    totalCount={catalogTotalCount}
                                    onPageChange={setCatalogPage}
                                />
                            ) : null}
                        </>
                    )}
                </div>
            ) : isError ? (
                <div className="border-border bg-card flex min-h-[350px] flex-col items-center justify-center gap-3 rounded-md border p-6 text-center shadow-sm">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                    <h3 className="text-foreground text-lg font-semibold">
                        Failed to load incident logs
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-sm">
                        An error occurred while communicating with the telemetry server. Please try
                        refreshing.
                    </p>
                    <Button onClick={() => void refetch()} variant="outline" className="mt-2">
                        Retry Connection
                    </Button>
                </div>
            ) : (
                <IncidentTable
                    incidents={displayIncidents}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onSelectIncident={(incident) => {
                        setSelectedIncident(incident);
                        setDrawerOpen(true);
                    }}
                    hasMore={Boolean(hasNextPage)}
                    isFetchingNextPage={isFetchingNextPage}
                    onLoadMore={() => void fetchNextPage()}
                    searchValue={search}
                    onSearchChange={setSearch}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    sections={sections}
                    groupMode={groupMode}
                    onGroupModeChange={setGroupMode}
                    isLoading={isIncidentsLoading}
                />
            )}

            <IncidentDrawer
                incident={selectedIncident}
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedIncident(null);
                }}
                onConfirm={handleConfirmIncident}
                onDismiss={handleDismissIncident}
                isSubmitting={isReviewing}
            />

            <BulkActions
                selectedCount={selectedIds.length}
                onConfirmBulk={handleConfirmBulk}
                onDismissBulk={handleDismissBulk}
                onClearSelection={() => setSelectedIds([])}
                isSubmitting={isReviewing}
            />
        </ExamsPageShell>
    );
}
