'use client';

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button, Spinner, Separator, PageHeader } from '@sentinel/ui';
import { ExamCardsGrid } from './exam-cards-grid';
import { ExamCombobox } from './exam-combobox';
import { IncidentTable } from './incident-table';
import { IncidentDrawer } from './incident-drawer';
import { BulkActions } from './bulk-actions';
import { ExamsPageShell } from '../../_components/layout';
import { useExamIncidentLogs } from '../_hooks/use-exam-incident-logs';

export function ExamIncidentLogsContent({ initialExamId }: { initialExamId?: string }) {
    const {
        examId,
        search,
        setSearch,
        examSearch,
        setExamSearch,
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
        exams,
        displayIncidents,
        sections,
        isExamsLoading,
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
            <div className="space-y-2">
                <PageHeader
                    title="Incident Logs & Analytics"
                    description="Review, confirm, or dismiss proctoring telemetry alerts recorded during examinations."
                    className="px-0"
                >
                    {examId && (
                        <div className="flex items-center gap-3">
                            <ExamCombobox
                                exams={exams || []}
                                selectedExamId={examId}
                                onSelectExam={handleExamChange}
                                searchValue={examSearch}
                                onSearchChange={setExamSearch}
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
                    )}
                </PageHeader>
                <Separator />
            </div>

            {!examId ? (
                <div className="flex flex-col gap-4">
                    {isExamsLoading ? (
                        <div className="border-border bg-card flex min-h-[350px] items-center justify-center rounded-md border shadow-sm">
                            <div className="flex flex-col items-center gap-3">
                                <Spinner className="text-primary h-8 w-8" />
                                <span className="text-muted-foreground text-sm">
                                    Loading examinations...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <ExamCardsGrid
                            exams={exams || []}
                            onSelectExam={handleExamChange}
                            searchValue={examSearch}
                            onSearchChange={setExamSearch}
                        />
                    )}
                </div>
            ) : isIncidentsLoading ? (
                <div className="border-border bg-card flex min-h-[350px] items-center justify-center rounded-md border shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                        <Spinner className="text-primary h-8 w-8" />
                        <span className="text-muted-foreground text-sm">
                            Loading proctoring logs...
                        </span>
                    </div>
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
