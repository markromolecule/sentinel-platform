'use client';

import { useState } from 'react';
import {
    useApi,
    useDebounce,
    useExamMonitoringOverviewQuery,
    useOverrideReconnectLimitMutation,
    useStableValue,
} from '@sentinel/hooks';
import { updateExamRuntimeAccess } from '@sentinel/services';
import { toast } from 'sonner';
import { RuntimeAccessAction, RuntimeAccessState } from '../_types';
import { MONITORING_PAGE_SIZE } from '../_constants';

/**
 * useMonitoring manages instructor live-monitoring filters, actions, and runtime access state.
 *
 * @param examId - Exam id whose live monitoring overview should be loaded.
 */
export function useMonitoring(examId: string) {
    const apiClient = useApi();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
    const [pendingAction, setPendingAction] = useState<RuntimeAccessAction | null>(null);
    const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
    const [reopenMinutes, setReopenMinutes] = useState('30');
    const [overridingStudentId, setOverridingStudentId] = useState<string | null>(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Queries & Mutations
    const {
        data: monitoring,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useExamMonitoringOverviewQuery(examId);

    const overrideReconnectLimitMutation = useOverrideReconnectLimitMutation({
        onSuccess: async () => {
            toast.success('Reconnect override granted successfully.');
            await refetch();
        },
        onError: (error: Error) => toast.error(error.message),
    });

    // Derived State
    const filteredStudents = useStableValue(() => {
        const students = monitoring?.students ?? [];

        return students.filter((student) => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                student.lastName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                student.studentNo.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [monitoring?.students, debouncedSearchQuery, filterStatus]);

    // Handlers
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handleFilterChange = (value: string) => {
        setFilterStatus(value);
        setPage(1);
    };

    const handleRuntimeAccessUpdate = async (
        state: RuntimeAccessState,
        reopenedUntil?: string | null,
    ) => {
        setIsUpdatingAccess(true);
        try {
            const runtimeAccess = await updateExamRuntimeAccess(apiClient, {
                id: examId,
                state,
                reopenedUntil,
            });
            toast.success(runtimeAccess.message);
            await refetch();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to update exam access.';
            toast.error(message);
        } finally {
            setIsUpdatingAccess(false);
        }
    };

    const handleConfirmAction = () => {
        if (!pendingAction) return;

        if (pendingAction === 'lock') {
            void handleRuntimeAccessUpdate('locked');
        } else if (pendingAction === 'reset') {
            void handleRuntimeAccessUpdate('open');
        } else {
            void handleRuntimeAccessUpdate('closed');
        }

        setPendingAction(null);
    };

    const handleSubmitReopen = () => {
        const minutes = Number(reopenMinutes);
        if (!Number.isFinite(minutes) || minutes <= 0) {
            toast.error('Enter a valid reopen window in minutes.');
            return;
        }

        const reopenedUntil = new Date(Date.now() + minutes * 60_000).toISOString();
        setIsReopenDialogOpen(false);
        void handleRuntimeAccessUpdate('reopened', reopenedUntil);
    };

    const handleOverrideReconnect = async (studentId: string, recordId?: string | null) => {
        setOverridingStudentId(studentId);
        try {
            await overrideReconnectLimitMutation.mutateAsync({
                id: examId,
                studentId: recordId ?? studentId,
                reason: 'Instructor granted a one-time reconnect override from monitoring.',
            });
        } finally {
            setOverridingStudentId(null);
        }
    };

    return {
        // Data
        monitoring,
        isLoading,
        isFetching,
        isError,
        filteredStudents,

        // State
        searchQuery,
        filterStatus,
        page,
        pageSize: MONITORING_PAGE_SIZE,
        isUpdatingAccess,
        pendingAction,
        isReopenDialogOpen,
        reopenMinutes,
        overridingStudentId,

        // State Setters
        setPendingAction,
        setIsReopenDialogOpen,
        setReopenMinutes,
        setPage,

        // Handlers
        handleSearchChange,
        handleFilterChange,
        handleConfirmAction,
        handleSubmitReopen,
        handleOverrideReconnect,
        refetch,
    };
}
