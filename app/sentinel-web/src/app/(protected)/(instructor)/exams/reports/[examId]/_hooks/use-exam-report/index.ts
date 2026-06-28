import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApi, useExamReportQuery } from '@sentinel/hooks';
import { createStudentExamAccessOverride, bulkFinalizeAttempts } from '@sentinel/services';
import type { ExamReportActionItem } from '@sentinel/shared/types';
import { toast } from 'sonner';

import type { ActionQueueType, ExamReportSection } from '../../_types';
import { getColumns } from '../../_components/columns';
import {
    DEFAULT_PAGE_SIZE,
    DEFAULT_ACTIVE_SECTION,
    DEFAULT_ACTIVE_QUEUE,
    SECTION_PARAM_KEY,
} from '../../_constants';
import type { UseExamReportOptions, UseExamReportResult } from './_types';

/**
 * Custom hook to manage the detailed exam report page state, fetching, and actions.
 * Encapsulates search inputs, tab navigation, override grants, and attempt finalizations.
 *
 * @param options - Configuration options containing the target exam ID.
 * @returns The page state, derived data, and event handler actions.
 */
export function useExamReport({ examId }: UseExamReportOptions): UseExamReportResult {
    const apiClient = useApi();
    const searchParams = useSearchParams();
    const sectionParam = searchParams.get(SECTION_PARAM_KEY);

    const [activeSection, setActiveSection] = useState<ExamReportSection>(() => {
        if (
            sectionParam === 'attempts' ||
            sectionParam === 'queue' ||
            sectionParam === 'logs'
        ) {
            return sectionParam;
        }
        return DEFAULT_ACTIVE_SECTION;
    });

    useEffect(() => {
        if (
            sectionParam === 'attempts' ||
            sectionParam === 'queue' ||
            sectionParam === 'overview' ||
            sectionParam === 'logs'
        ) {
            setActiveSection(sectionParam as ExamReportSection);
        }
    }, [sectionParam]);

    const [searchValue, setSearchValue] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string | undefined>(undefined);
    const [studentPage, setStudentPage] = useState(1);
    const [activeQueue, setActiveQueue] = useState<ActionQueueType>(DEFAULT_ACTIVE_QUEUE);
    const [actionPages, setActionPages] = useState<Record<ActionQueueType, number>>({
        review: 1,
        makeup: 1,
        retake: 1,
    });
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const deferredSearchValue = useDeferredValue(searchValue);

    const reportQuery = useMemo(
        () => ({
            search: deferredSearchValue.trim() || undefined,
            sectionId: sectionFilter,
            page: studentPage,
            pageSize: DEFAULT_PAGE_SIZE,
        }),
        [deferredSearchValue, sectionFilter, studentPage],
    );

    const { data: report, isLoading, isError, refetch, isFetching } = useExamReportQuery(
        examId,
        reportQuery,
    );

    useEffect(() => {
        setStudentPage(1);
    }, [deferredSearchValue, sectionFilter]);

    const sectionOptions = useMemo(
        () => (report?.sections ?? []).map((section) => [section.id, section.name] as const),
        [report?.sections],
    );

    const actionQueues = useMemo(
        () =>
            report
                ? {
                    review: report.actionItems.review,
                    makeup: report.actionItems.makeup,
                    retake: report.actionItems.retake,
                }
                : {
                    review: [],
                    makeup: [],
                    retake: [],
                },
        [report],
    );

    const columns = useMemo(() => getColumns(examId), [examId]);

    const handleGrantOverride = async (
        item: ExamReportActionItem,
        overrideType: 'MAKEUP' | 'RETAKE',
    ) => {
        const minutesInput = window.prompt(
            `Grant a ${overrideType === 'MAKEUP' ? 'makeup' : 'retake'} window for how many minutes?`,
            '120',
        );

        if (!minutesInput) {
            return;
        }

        const minutes = Number(minutesInput);

        if (!Number.isFinite(minutes) || minutes <= 0) {
            toast.error('Enter a valid availability window in minutes.');
            return;
        }

        const notes = window.prompt(
            `Add a note for this ${overrideType === 'MAKEUP' ? 'makeup' : 'retake'} grant.`,
            overrideType === 'MAKEUP' ? 'Approved makeup window.' : 'Approved retake window.',
        );

        setActiveActionId(item.studentId);

        try {
            await createStudentExamAccessOverride(apiClient, {
                id: examId,
                studentId: item.studentId,
                overrideType,
                availableFrom: new Date().toISOString(),
                availableUntil: new Date(Date.now() + minutes * 60_000).toISOString(),
                allowedAttempts: 1,
                sourceAttemptId: overrideType === 'RETAKE' ? item.attemptId : null,
                notes: notes?.trim() ? notes.trim() : null,
            });

            toast.success(
                overrideType === 'MAKEUP'
                    ? 'Makeup window granted successfully.'
                    : 'Retake window granted successfully.',
            );
            await refetch();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to grant override.');
        } finally {
            setActiveActionId(null);
        }
    };

    const [isFinalizingAll, setIsFinalizingAll] = useState(false);

    const handleFinalizeAll = async () => {
        setIsFinalizingAll(true);
        try {
            const result = await bulkFinalizeAttempts(apiClient, examId);
            toast.success(`Successfully finalized ${result.count} attempt(s).`);
            await refetch();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to finalize attempts.');
        } finally {
            setIsFinalizingAll(false);
        }
    };

    return {
        report,
        isLoading,
        isError,
        isFetching,
        refetch,
        activeSection,
        setActiveSection,
        searchValue,
        setSearchValue,
        sectionFilter,
        setSectionFilter,
        sectionOptions,
        studentPage,
        setStudentPage,
        pageSize: DEFAULT_PAGE_SIZE,
        columns,
        isFinalizingAll,
        handleFinalizeAll,
        activeQueue,
        setActiveQueue,
        actionPages,
        setActionPages,
        activeActionId,
        actionQueues,
        handleGrantOverride,
    };
}
