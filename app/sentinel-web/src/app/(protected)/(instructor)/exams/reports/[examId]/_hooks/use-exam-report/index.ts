import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApi, useExamReportQuery } from '@sentinel/hooks';
import { bulkFinalizeAttempts } from '@sentinel/services';
import type { ExamReportActionItem } from '@sentinel/shared/types';
import { toast } from 'sonner';

import type { ActionQueueType, ExamReportSection } from '../../_types';
import { getColumns } from '../../_components/columns';
import {
    DEFAULT_PAGE_SIZE,
    DEFAULT_ACTIVE_QUEUE,
    SECTION_PARAM_KEY,
    resolveExamReportSection,
} from '../../_constants';
import type { UseExamReportOptions, UseExamReportResult } from './_types';

async function grantLifecycleOverride(args: {
    apiClient: ReturnType<typeof useApi>;
    examId: string;
    item: ExamReportActionItem;
    overrideType: 'MAKEUP' | 'RETAKE';
    availableFrom: string;
    availableUntil: string;
    notes: string | null;
}) {
    const endpoint =
        args.overrideType === 'MAKEUP'
            ? `/exams/${args.examId}/students/${args.item.studentId}/lifecycle/grant-makeup`
            : `/exams/${args.examId}/students/${args.item.studentId}/lifecycle/grant-retake`;

    return await args.apiClient(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            availableFrom: args.availableFrom,
            availableUntil: args.availableUntil,
            allowedAttempts: 1,
            sourceAttemptId: args.overrideType === 'RETAKE' ? args.item.attemptId : undefined,
            notes: args.notes,
        }),
    });
}

function buildGrantSuccessMessage(args: { overrideType: 'MAKEUP' | 'RETAKE'; response: any }) {
    const remediationExam = args.response?.remediationExam;
    const remediationSchedule = args.response?.remediationSchedule;
    const label = args.overrideType === 'MAKEUP' ? 'Makeup' : 'Retake';

    if (!remediationExam || !remediationSchedule?.scheduledDate) {
        return `${label} window granted successfully.`;
    }

    const scheduledDate = new Date(remediationSchedule.scheduledDate);
    const formattedSchedule = Number.isNaN(scheduledDate.getTime())
        ? remediationSchedule.scheduledDate
        : scheduledDate.toLocaleString();

    return `${label} scheduled for ${formattedSchedule} as "${remediationExam.title}".`;
}

/**
 * Custom hook to manage the detailed exam report page state, fetching, and actions.
 * Encapsulates search inputs, tab navigation, override grants, and attempt finalizations.
 *
 * @param options - Configuration options containing the target exam ID.
 * @returns The page state, derived data, and event handler actions.
 */
export function useExamReport({ examId }: UseExamReportOptions): UseExamReportResult {
    const apiClient = useApi();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sectionParam = searchParams.get(SECTION_PARAM_KEY);

    const activeSection = resolveExamReportSection(sectionParam);

    const setActiveSection = useCallback(
        (section: ExamReportSection) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(SECTION_PARAM_KEY, section);
            router.push(`/exams/reports/${examId}?${params.toString()}`);
        },
        [examId, router, searchParams],
    );

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

    const {
        data: report,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useExamReportQuery(examId, reportQuery);

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
        availableFrom: string,
        availableUntil: string,
        notes: string | null,
    ) => {
        setActiveActionId(item.studentId);

        try {
            const response = await grantLifecycleOverride({
                apiClient,
                examId,
                item,
                overrideType,
                availableFrom,
                availableUntil,
                notes,
            });

            toast.success(buildGrantSuccessMessage({ overrideType, response }));
            await refetch();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? `Failed to grant remediation: ${error.message}`
                    : 'Failed to grant remediation.',
            );
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
