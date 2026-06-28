'use client';

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button, Spinner } from '@sentinel/ui';
import { useIncidentLogs } from '../hooks/use-incident-logs';
import { IncidentTable } from './incident-table';
import { IncidentDrawer } from './incident-drawer';
import { BulkActions } from './bulk-actions';

interface IncidentLogsViewProps {
    examId: string;
}

/**
 * IncidentLogsView renders the incident log table, filter controls,
 * and review sheet/actions for a specific examination.
 * 
 * @param examId - The UUID of the exam to manage logs for.
 */
export function IncidentLogsView({ examId }: IncidentLogsViewProps) {
    const {
        search,
        setSearch,
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
        displayIncidents,
        sections,
        isIncidentsLoading,
        isFetching,
        isError,
        hasNextPage,
        isFetchingNextPage,
        isReviewing,
        refetch,
        fetchNextPage,
        handleConfirmIncident,
        handleDismissIncident,
        handleConfirmBulk,
        handleDismissBulk,
    } = useIncidentLogs(examId);

    if (isIncidentsLoading) {
        return (
            <div className="border-border bg-card flex min-h-[350px] items-center justify-center rounded-md border shadow-sm">
                <div className="flex flex-col items-center gap-3">
                    <Spinner className="text-primary h-8 w-8" />
                    <span className="text-muted-foreground text-sm">
                        Loading proctoring logs...
                    </span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
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
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Incident Logs & Analytics</h2>
                    <p className="text-muted-foreground text-sm">
                        Review, confirm, or dismiss proctoring telemetry alerts recorded during examinations.
                    </p>
                </div>
                <div className="flex items-center gap-3">
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
            </div>

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

            {/* Detail Drawer Side Sheet */}
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

            {/* Floating Bulk Action Bar */}
            <BulkActions
                selectedCount={selectedIds.length}
                onConfirmBulk={handleConfirmBulk}
                onDismissBulk={handleDismissBulk}
                onClearSelection={() => setSelectedIds([])}
                isSubmitting={isReviewing}
            />
        </div>
    );
}
