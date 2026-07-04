'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    useExamIncidentsQuery,
    useUpdateExamIncidentsMutation,
    useExamReportQuery,
    useExamReportsListQuery,
    useDebounce,
} from '@sentinel/hooks';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { type ApiGetExamIncidentsQuery, type ApiIncidentLogItem } from '@sentinel/services';
import { buildCoreExamLogsHref } from '@/lib/routes/exam-management-routes';

/**
 * Custom hook encapsulating state, API queries, data mapping, and action handlers
 * for the exam incident logs view.
 */
export function useExamIncidentLogs(initialExamId?: string) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const examId = initialExamId ?? (searchParams.get('examId') || '');
    const catalogPageSize = 6;

    // Filter states
    const [search, setSearch] = useState('');
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogPage, setCatalogPage] = useState(1);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [groupMode, setGroupMode] = useState<'logs' | 'student'>('logs');

    // Selection & Detail states
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<ApiIncidentLogItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Debounce search inputs to limit API requests
    const debouncedSearch = useDebounce(search, 300);
    const debouncedCatalogSearch = useDebounce(catalogSearch, 300);

    // Fetch paginated list of reportable exams for the catalog view
    const { data: catalogData, isLoading: isCatalogLoading } = useExamReportsListQuery({
        page: catalogPage,
        limit: catalogPageSize,
        search: debouncedCatalogSearch.trim() || undefined,
    });

    const reportableExams = catalogData?.data ?? [];
    const catalogTotalCount = catalogData?.meta?.total ?? 0;
    const catalogPageCount = catalogData?.meta?.totalPages ?? 1;

    const handleCatalogSearchChange = (value: string) => {
        setCatalogSearch(value);
        setCatalogPage(1);
    };

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
                q.severity = firstVal as ApiGetExamIncidentsQuery['severity'];
            } else if (filter.id === 'incidentType') {
                q.type = firstVal;
            } else if (filter.id === 'status') {
                q.status = firstVal as ApiGetExamIncidentsQuery['status'];
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
    const selectorExams = useMemo(() => {
        if (!report?.exam || reportableExams.some((exam) => exam.id === report.exam.id)) {
            return reportableExams;
        }

        return [
            {
                id: report.exam.id,
                title: report.exam.title,
                subject: report.exam.subject,
                scheduledDate: report.exam.scheduledDate,
                endDateTime: report.exam.endDateTime,
                durationMinutes: report.exam.durationMinutes,
                passingScore: report.exam.passingScore,
                studentsCount: report.students?.length ?? 0,
            },
            ...reportableExams,
        ];
    }, [report, reportableExams]);

    const { mutateAsync: reviewIncidents, isPending: isReviewing } =
        useUpdateExamIncidentsMutation(examId);

    // Flatten pages data into single array
    const incidents = useMemo(() => {
        return infiniteData?.pages.flatMap((page) => page.data) ?? [];
    }, [infiniteData]);

    // Group incidents by student if groupMode is set to 'student'
    const displayIncidents = useMemo(() => {
        if (groupMode !== 'student') return incidents;

        const studentMap = new Map<
            string,
            {
                studentId: string;
                studentName: string;
                studentNo: string;
                sectionName: string;
                severity: 'LOW' | 'MEDIUM' | 'HIGH';
                status: ApiIncidentLogItem['status'];
                elapsedSeconds: number;
                timestamp: string;
                platform: 'WEB' | 'MOBILE' | null;
                source: 'CLIENT' | 'SERVER' | 'AI' | null;
                incidentCount: number;
                incidents: ApiIncidentLogItem[];
                baseline: ApiIncidentLogItem;
            }
        >();

        incidents.forEach((item) => {
            const key = item.studentId || item.studentName || 'unknown';
            const existing = studentMap.get(key);
            if (!existing) {
                studentMap.set(key, {
                    studentId: item.studentId || '',
                    studentName: item.studentName || 'Unknown Student',
                    studentNo: item.studentNo || 'No ID',
                    sectionName: item.sectionName || 'Unassigned',
                    severity: item.severity || 'LOW',
                    status: item.status || 'PENDING',
                    elapsedSeconds: item.elapsedSeconds,
                    timestamp: item.timestamp || '',
                    platform: item.platform,
                    source: item.source,
                    incidentCount: 1,
                    incidents: [item],
                    baseline: item,
                });
            } else {
                existing.incidentCount += 1;
                existing.incidents.push(item);

                // Severity priority: HIGH > MEDIUM > LOW
                const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                const currentVal = severityOrder[existing.severity] || 0;
                const itemVal = severityOrder[item.severity || 'LOW'] || 0;
                if (itemVal > currentVal) {
                    existing.severity = item.severity || 'LOW';
                }

                // Status priority: PENDING > CONFIRMED > DISMISSED
                if (existing.status !== 'PENDING') {
                    if (item.status === 'PENDING') {
                        existing.status = 'PENDING';
                    } else if (existing.status !== 'CONFIRMED' && item.status === 'CONFIRMED') {
                        existing.status = 'CONFIRMED';
                    }
                }

                // Latest timestamp
                if (
                    item.timestamp &&
                    (!existing.timestamp || new Date(item.timestamp) > new Date(existing.timestamp))
                ) {
                    existing.timestamp = item.timestamp;
                    existing.elapsedSeconds = item.elapsedSeconds;
                }
            }
        });

        return Array.from(studentMap.values()).map((s) => ({
            ...s.baseline,
            severity: s.severity,
            status: s.status,
            elapsedSeconds: s.elapsedSeconds,
            timestamp: s.timestamp,
            details: {
                ...s.baseline.details,
                _incidents: s.incidents,
                _isGrouped: true,
                _incidentCount: s.incidentCount,
            },
        }));
    }, [incidents, groupMode]);

    const handleGroupModeChange = (nextGroupMode: 'logs' | 'student') => {
        setSelectedIds([]);
        setGroupMode(nextGroupMode);
    };

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
        if (selectedId && selectedId !== 'NONE') {
            setSelectedIds([]);
            router.push(buildCoreExamLogsHref(selectedId));
            return;
        }

        setSelectedIds([]);
        router.push('/exams/logs');
    };

    // Review Actions
    const handleConfirmIncident = async (incidentIds: string[], notes: string) => {
        try {
            await reviewIncidents({
                incidentIds,
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

    const handleDismissIncident = async (incidentIds: string[], notes: string) => {
        try {
            await reviewIncidents({
                incidentIds,
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

        let targetIds = selectedIds;
        if (groupMode === 'student') {
            targetIds = [];
            selectedIds.forEach((baselineId) => {
                const groupedItem = displayIncidents.find((item) => item.incidentId === baselineId);
                const groupedIncidents = groupedItem?.details?._incidents as
                    Array<{ incidentId: string }> | undefined;
                if (groupedIncidents) {
                    groupedIncidents.forEach((incident) => {
                        targetIds.push(incident.incidentId);
                    });
                } else {
                    targetIds.push(baselineId);
                }
            });
        }

        try {
            await reviewIncidents({
                incidentIds: targetIds,
                status: 'CONFIRMED',
                reviewNotes: 'Bulk confirmed by instructor',
            });
            toast.success(`Successfully confirmed ${targetIds.length} incidents`);
            setSelectedIds([]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to confirm incidents');
        }
    };

    const handleDismissBulk = async () => {
        if (selectedIds.length === 0) return;

        let targetIds = selectedIds;
        if (groupMode === 'student') {
            targetIds = [];
            selectedIds.forEach((baselineId) => {
                const groupedItem = displayIncidents.find((item) => item.incidentId === baselineId);
                const groupedIncidents = groupedItem?.details?._incidents as
                    Array<{ incidentId: string }> | undefined;
                if (groupedIncidents) {
                    groupedIncidents.forEach((incident) => {
                        targetIds.push(incident.incidentId);
                    });
                } else {
                    targetIds.push(baselineId);
                }
            });
        }

        try {
            await reviewIncidents({
                incidentIds: targetIds,
                status: 'DISMISSED',
                reviewNotes: 'Bulk dismissed by instructor',
            });
            toast.success(`Successfully dismissed ${targetIds.length} incidents`);
            setSelectedIds([]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to dismiss incidents');
        }
    };

    return {
        examId,
        search,
        setSearch,
        catalogSearch,
        setCatalogSearch: handleCatalogSearchChange,
        catalogPage,
        setCatalogPage,
        catalogPageSize,
        catalogPageCount,
        catalogTotalCount,
        columnFilters,
        setColumnFilters,
        groupMode,
        setGroupMode: handleGroupModeChange,
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
    };
}
