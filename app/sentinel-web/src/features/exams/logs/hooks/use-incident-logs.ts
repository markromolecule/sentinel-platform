'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
    useExamIncidentsQuery,
    useUpdateExamIncidentsMutation,
    useExamReportQuery,
    useDebounce,
} from '@sentinel/hooks';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { type ApiGetExamIncidentsQuery, type ApiIncidentLogItem } from '@sentinel/services';

type IncidentLogSnapshot = {
    occurrenceCount: number;
};

function getIncidentOccurrenceCount(item: ApiIncidentLogItem) {
    const occurrenceCount = item.details?.occurrenceCount;
    return typeof occurrenceCount === 'number' && occurrenceCount > 0 ? occurrenceCount : 1;
}

/**
 * Custom hook encapsulating state, API queries, data mapping, and action handlers
 * for the exam incident logs view.
 *
 * @param examId - The UUID of the exam to fetch incident logs for.
 */
export function useIncidentLogs(examId: string) {
    // Filter states
    const [search, setSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [groupMode, setGroupMode] = useState<'logs' | 'student'>('logs');

    // Selection & Detail states
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<ApiIncidentLogItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const incidentSnapshotsRef = useRef<Map<string, IncidentLogSnapshot>>(new Map());
    const hasHydratedIncidentSnapshotsRef = useRef(false);
    const hydratedExamIdRef = useRef<string | null>(null);

    // Debounce search inputs to limit API requests
    const debouncedSearch = useDebounce(search, 300);

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

    useEffect(() => {
        const nextSnapshots = new Map<string, IncidentLogSnapshot>();
        const shouldWarn =
            hasHydratedIncidentSnapshotsRef.current && hydratedExamIdRef.current === examId;

        for (const item of incidents) {
            const occurrenceCount = getIncidentOccurrenceCount(item);
            const previous = incidentSnapshotsRef.current.get(item.incidentId);

            if (shouldWarn && !previous) {
                toast.warning('New proctoring incident logged.', {
                    description: `${item.studentName ?? 'A student'} received ${item.incidentType}.`,
                });
            } else if (shouldWarn && previous && occurrenceCount > previous.occurrenceCount) {
                toast.warning('Proctoring incident updated.', {
                    description: `${item.studentName ?? 'A student'} now has ${occurrenceCount} occurrences for ${item.incidentType}.`,
                });
            }

            nextSnapshots.set(item.incidentId, { occurrenceCount });
        }

        incidentSnapshotsRef.current = nextSnapshots;
        hasHydratedIncidentSnapshotsRef.current = true;
        hydratedExamIdRef.current = examId;
    }, [examId, incidents]);

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

    // Clear selections when switching grouping views
    useEffect(() => {
        setSelectedIds([]);
    }, [groupMode]);

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
                if (groupedItem?.details?._incidents) {
                    groupedItem.details._incidents.forEach((i: any) => {
                        targetIds.push(i.incidentId);
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
                if (groupedItem?.details?._incidents) {
                    groupedItem.details._incidents.forEach((i: any) => {
                        targetIds.push(i.incidentId);
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
    };
}
