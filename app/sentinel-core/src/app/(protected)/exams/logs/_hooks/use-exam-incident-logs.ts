'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExamIncidentsQuery, useExamReportQuery } from '@sentinel/hooks';
import { type ApiIncidentLogItem } from '@sentinel/services';
import type { ProctorExam } from '@sentinel/shared';
import { buildCoreExamLogsHref } from '@/lib/routes/exam-management-routes';
import { useExamCatalog } from './use-exam-catalog';
import { useIncidentFilters } from './use-incident-filters';
import { groupIncidentsByStudent } from './use-incident-grouping';
import { useIncidentActions } from './use-incident-actions';

/**
 * Custom hook encapsulating state, API queries, data mapping, and action handlers
 * for the exam incident logs view. Orchestrates sub-hooks for modularity.
 */
export function useExamIncidentLogs(initialExamId?: string) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const examId = initialExamId ?? (searchParams.get('examId') || '');
    const catalogPageSize = 6;

    // 1. Catalog hook
    const {
        catalogSearch,
        setCatalogSearch,
        catalogPage,
        setCatalogPage,
        catalogTotalCount,
        catalogPageCount,
        reportableExams,
        isCatalogLoading,
    } = useExamCatalog(catalogPageSize);

    // 2. Filters hook
    const { search, setSearch, columnFilters, setColumnFilters, queryParams } =
        useIncidentFilters();

    // 3. Selection & Detail states local to container view
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<ApiIncidentLogItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [groupMode, setGroupMode] = useState<'logs' | 'student'>('logs');

    // 4. React Query Hooks for incidents & reports
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

    // 5. Build selector exams list
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
            } as unknown as ProctorExam,
            ...reportableExams,
        ];
    }, [report, reportableExams]);

    // 6. Flatten and group incidents
    const incidents = useMemo(() => {
        return infiniteData?.pages.flatMap((page) => page.data) ?? [];
    }, [infiniteData]);

    const displayIncidents = useMemo(() => {
        if (groupMode !== 'student') return incidents;
        return groupIncidentsByStudent(incidents);
    }, [incidents, groupMode]);

    // 7. Extract unique sections
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

    // 8. Actions hook
    const {
        isReviewing,
        handleConfirmIncident,
        handleDismissIncident,
        handleConfirmBulk,
        handleDismissBulk,
    } = useIncidentActions({
        examId,
        setSelectedIds,
        setDrawerOpen,
        setSelectedIncident,
        displayIncidents,
        groupMode,
        selectedIds,
    });

    const handleGroupModeChange = (nextGroupMode: 'logs' | 'student') => {
        setSelectedIds([]);
        setGroupMode(nextGroupMode);
    };

    const handleExamChange = (selectedId: string) => {
        if (selectedId && selectedId !== 'NONE') {
            setSelectedIds([]);
            router.push(buildCoreExamLogsHref(selectedId));
            return;
        }

        setSelectedIds([]);
        router.push('/exams/logs');
    };

    return {
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
