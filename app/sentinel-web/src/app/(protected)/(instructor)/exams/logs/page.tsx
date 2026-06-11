'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ShieldAlert, RefreshCw, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import {
    useExamIncidentsQuery,
    useUpdateExamIncidentsMutation,
    useExamReportQuery,
    useExamsQuery,
    useDebounce,
} from '@sentinel/hooks';
import { Button, Spinner, Separator } from '@sentinel/ui';
import { ExamCardsGrid } from './_components/exam-cards-grid';
import { ExamCombobox } from './_components/exam-combobox';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { type ApiGetExamIncidentsQuery, ApiIncidentLogItem } from '@sentinel/services';
import { IncidentTable } from './_components/incident-table';
import { IncidentDrawer } from './_components/incident-drawer';
import { BulkActions } from './_components/bulk-actions';
import { ExamsPageShell } from '../_components/layout';

export default function ExamIncidentLogsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const examId = searchParams.get('examId') || '';

    // Filter states
    const [search, setSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // Selection & Detail states
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<ApiIncidentLogItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Debounce search input to limit API requests
    const debouncedSearch = useDebounce(search, 300);

    // Fetch list of all exams
    const { data: exams, isLoading: isExamsLoading } = useExamsQuery();

    // Build API query parameters
    const queryParams = useMemo(() => {
        const q: Omit<ApiGetExamIncidentsQuery, 'page'> = {
            limit: 50,
        };

        if (debouncedSearch.trim() !== '') {
            q.studentId = debouncedSearch.trim();
        }

        columnFilters.forEach((filter) => {
            const val = filter.value as string[] | undefined;
            if (!val || val.length === 0) return;

            const firstVal = val[0];

            if (filter.id === 'sectionName') {
                q.sectionId = firstVal;
            } else if (filter.id === 'severity') {
                q.severity = firstVal as any;
            } else if (filter.id === 'incidentType') {
                q.type = firstVal;
            } else if (filter.id === 'status') {
                q.status = firstVal as any;
            }
        });

        return q;
    }, [debouncedSearch, columnFilters]);

    // React Query Hooks (only active if an exam is selected)
    const {
        data: infiniteData,
        isLoading: isIncidentsLoading,
        isFetching,
        isError,
        refetch,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useExamIncidentsQuery(examId, queryParams);

    const { data: report } = useExamReportQuery(examId);

    const { mutateAsync: reviewIncidents, isPending: isReviewing } =
        useUpdateExamIncidentsMutation(examId);

    // Flatten pages data into single array
    const incidents = useMemo(() => {
        return infiniteData?.pages.flatMap((page) => page.data) ?? [];
    }, [infiniteData]);

    // Extract unique sections of enrolled students from report
    const sections = useMemo(() => {
        if (!report?.students) return [];
        const unique = new Map<string, string>();
        for (const student of report.students) {
            if (student.sectionId && student.sectionName) {
                unique.set(student.sectionId, student.sectionName);
            }
        }
        return Array.from(unique.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [report]);

    // Selector Change Handler
    const handleExamChange = (selectedId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedId && selectedId !== 'NONE') {
            params.set('examId', selectedId);
        } else {
            params.delete('examId');
        }
        setSelectedIds([]);
        router.push(`${pathname}?${params.toString()}`);
    };


    // Review Actions
    const handleConfirmIncident = async (incidentId: string, notes: string) => {
        try {
            await reviewIncidents({
                incidentIds: [incidentId],
                status: 'CONFIRMED',
                reviewNotes: notes,
            });
            toast.success('Incident confirmed successfully');
            setDrawerOpen(false);
            setSelectedIncident(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to confirm incident');
        }
    };

    const handleDismissIncident = async (incidentId: string, notes: string) => {
        try {
            await reviewIncidents({
                incidentIds: [incidentId],
                status: 'DISMISSED',
                reviewNotes: notes,
            });
            toast.success('Incident dismissed successfully');
            setDrawerOpen(false);
            setSelectedIncident(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to dismiss incident');
        }
    };

    const handleConfirmBulk = async () => {
        if (selectedIds.length === 0) return;
        try {
            await reviewIncidents({
                incidentIds: selectedIds,
                status: 'CONFIRMED',
                reviewNotes: 'Bulk confirmed by instructor',
            });
            toast.success(`Successfully confirmed ${selectedIds.length} incidents`);
            setSelectedIds([]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to confirm incidents');
        }
    };

    const handleDismissBulk = async () => {
        if (selectedIds.length === 0) return;
        try {
            await reviewIncidents({
                incidentIds: selectedIds,
                status: 'DISMISSED',
                reviewNotes: 'Bulk dismissed by instructor',
            });
            toast.success(`Successfully dismissed ${selectedIds.length} incidents`);
            setSelectedIds([]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to dismiss incidents');
        }
    };

    return (
        <ExamsPageShell className="min-h-full">
            {/* Header and Separator Area */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-red-500">
                            <ShieldAlert className="h-6 w-6" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Incident Logs & Analytics
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            Review, confirm, or dismiss proctoring telemetry alerts recorded during examinations.
                        </p>
                    </div>
                    {examId && (
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <ExamCombobox
                                exams={exams || []}
                                selectedExamId={examId}
                                onSelectExam={handleExamChange}
                            />
                            <Button
                                variant="outline"
                                onClick={() => void refetch()}
                                disabled={isFetching}
                                className="self-start sm:self-center gap-2 rounded-xl h-10"
                            >
                                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                                Refresh Logs
                            </Button>
                        </div>
                    )}
                </div>
                <Separator />
            </div>

            {/* Content Logic */}
            {!examId ? (
                /* Card Selection Grid */
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-lg font-semibold text-foreground">Select an Examination</h2>
                        <p className="text-sm text-muted-foreground">
                            Choose an exam from the list below to query, inspect, and review recorded student incident telemetry.
                        </p>
                    </div>
                    {isExamsLoading ? (
                        <div className="flex min-h-[350px] items-center justify-center border border-border bg-card rounded-2xl shadow-sm">
                            <div className="flex flex-col items-center gap-3">
                                <Spinner className="h-8 w-8 text-primary" />
                                <span className="text-sm text-muted-foreground">Loading examinations...</span>
                            </div>
                        </div>
                    ) : (
                        <ExamCardsGrid
                            exams={exams || []}
                            onSelectExam={handleExamChange}
                        />
                    )}
                </div>
            ) : isIncidentsLoading ? (
                /* Loading State */
                <div className="flex min-h-[350px] items-center justify-center border border-border bg-card rounded-xl shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                        <Spinner className="h-8 w-8 text-primary" />
                        <span className="text-sm text-muted-foreground">Loading proctoring logs...</span>
                    </div>
                </div>
            ) : isError ? (
                /* Error State */
                <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 border border-border bg-card rounded-xl shadow-sm text-center p-6">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                    <h3 className="text-lg font-semibold text-foreground">Failed to load incident logs</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        An error occurred while communicating with the telemetry server. Please try refreshing.
                    </p>
                    <Button onClick={() => void refetch()} variant="outline" className="rounded-xl mt-2">
                        Retry Connection
                    </Button>
                </div>
            ) : (
                <>
                    <IncidentTable
                        incidents={incidents}
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
                    />
                </>
            )}

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
        </ExamsPageShell>
    );
}
