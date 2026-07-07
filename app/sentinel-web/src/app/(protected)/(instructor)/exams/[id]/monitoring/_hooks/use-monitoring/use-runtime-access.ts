import { useState } from 'react';
import { useApi } from '@sentinel/hooks';
import { updateExamRuntimeAccess } from '@sentinel/services';
import { toast } from 'sonner';
import type { RuntimeAccessAction, RuntimeAccessState } from '../../_types';

type UseRuntimeAccessProps = {
    examId: string;
    refetch: () => Promise<unknown>;
};

/**
 * useRuntimeAccess manages global exam runtime access states (lock, open, closed, reopened)
 * and their corresponding update mutations.
 *
 * @param props - Hook options including examId and query refetch function.
 */
export function useRuntimeAccess({ examId, refetch }: UseRuntimeAccessProps) {
    const apiClient = useApi();

    const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
    const [pendingAction, setPendingAction] = useState<RuntimeAccessAction | null>(null);
    const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
    const [reopenMinutes, setReopenMinutes] = useState('30');

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

    return {
        isUpdatingAccess,
        pendingAction,
        isReopenDialogOpen,
        reopenMinutes,
        setPendingAction,
        setIsReopenDialogOpen,
        setReopenMinutes,
        handleConfirmAction,
        handleSubmitReopen,
        handleRuntimeAccessUpdate,
    };
}
