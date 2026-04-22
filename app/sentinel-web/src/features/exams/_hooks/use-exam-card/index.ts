import { useState, useCallback } from 'react';
import {
    useDeleteExamMutation,
    useUpdateExamStatusMutation,
    useActivePermissions,
} from '@sentinel/hooks';
import { toast } from 'sonner';
import { Monitor, Pencil, Eye, CheckCircle, XCircle, ArchiveRestore } from 'lucide-react';
import { isExamPastScheduleWindow } from '@sentinel/shared';
import { ExamStatus } from '@sentinel/shared/types';
import type { UseExamCardProps, UseExamCardReturn, ExamPrimaryAction } from './_types';

export function useExamCard({ exam }: UseExamCardProps): UseExamCardReturn {
    const { hasPermission } = useActivePermissions();
    const canBypassLock = hasPermission('examinations:bypass_publish_lock');

    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const isScheduleExpired = isExamPastScheduleWindow({
        scheduledDate: exam.scheduledDate,
        endDateTime: exam.endDateTime,
        durationMinutes: exam.duration,
    });
    const deleteExamMutation = useDeleteExamMutation({
        onSuccess: () => {
            toast.success('Exam deleted successfully.');
            setShowDeleteAlert(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete exam.');
            setShowDeleteAlert(false);
        },
    });
    const updateExamStatusMutation = useUpdateExamStatusMutation({
        onSuccess: () => {},
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update exam status.');
        },
    });

    const handleDelete = useCallback(() => {
        setPendingAction('delete');
        deleteExamMutation.mutate(exam.id, {
            onSettled: () => {
                setPendingAction(null);
            },
        });
    }, [deleteExamMutation, exam.id]);

    const handleStatusChange = useCallback(
        (actionKey: string, newStatus: ExamStatus, successMessage: string) => {
            setPendingAction(actionKey);
            updateExamStatusMutation.mutate(
                {
                    id: exam.id,
                    status: newStatus,
                },
                {
                    onSuccess: () => {
                        toast.success(successMessage);
                    },
                    onSettled: () => {
                        setPendingAction(null);
                    },
                },
            );
        },
        [exam.id, updateExamStatusMutation],
    );

    const getPrimaryActions = useCallback((): ExamPrimaryAction[] => {
        const monitorStatuses = new Set(['published', 'active', 'in-progress']);
        const actions: ExamPrimaryAction[] = [];
        const isStatusUpdating = updateExamStatusMutation.isPending;

        if (exam.status === 'draft') {
            actions.push({
                label: 'Builder',
                href: `/exams/${exam.id}/builder`,
                icon: Pencil,
                variant: 'outline',
            });
            actions.push({
                label: 'Publish',
                onClick: () =>
                    handleStatusChange('publish', 'published', 'Exam published successfully!'),
                icon: CheckCircle,
                variant: 'default',
                disabled: isStatusUpdating,
                isLoading: isStatusUpdating && pendingAction === 'publish',
            });
            return actions;
        }

        if (monitorStatuses.has(exam.status)) {
            actions.push({
                label: 'Unpublish',
                onClick: () =>
                    handleStatusChange('unpublish', 'draft', 'Exam unpublished successfully.'),
                icon: XCircle,
                variant: 'outline',
                disabled: isStatusUpdating,
                isLoading: isStatusUpdating && pendingAction === 'unpublish',
            });
            actions.push({
                label: 'Monitor',
                href: `/exams/${exam.id}/monitoring`,
                icon: Monitor,
                variant: 'default',
            });
            return actions;
        }

        if (exam.status === 'archived') {
            actions.push({
                label: 'View',
                href: `/exams/${exam.id}/builder`,
                icon: Eye,
                variant: 'outline',
            });

            if (isScheduleExpired) {
                if (canBypassLock) {
                    actions.push({
                        label: 'Reschedule',
                        onClick: () => setShowEdit(true),
                        icon: Pencil,
                        variant: 'default',
                    });
                }
            } else {
                actions.push({
                    label: 'Unarchive',
                    onClick: () =>
                        handleStatusChange('unarchive', 'draft', 'Exam unarchived successfully.'),
                    icon: ArchiveRestore,
                    variant: 'default',
                    disabled: isStatusUpdating,
                    isLoading: isStatusUpdating && pendingAction === 'unarchive',
                });
            }

            return actions;
        }

        actions.push({
            label: 'View',
            href: `/exams/${exam.id}/builder`,
            icon: Eye,
            variant: 'outline',
        });
        return actions;
    }, [
        canBypassLock,
        exam.id,
        exam.status,
        handleStatusChange,
        isScheduleExpired,
        pendingAction,
        updateExamStatusMutation.isPending,
    ]);

    const statusClass =
        exam.status === 'active' || exam.status === 'published' || exam.status === 'in-progress'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : exam.status === 'draft'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-border text-muted-foreground';

    return {
        showDeleteAlert,
        setShowDeleteAlert,
        showEdit,
        setShowEdit,
        handleDelete,
        primaryActions: getPrimaryActions(),
        statusClass,
    };
}
