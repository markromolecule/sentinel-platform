'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@sentinel/hooks';
import {
    getExamLobbyWaitingList,
    updateExamLobbyAdmissions,
    type ExamLobbyWaitingStudent,
} from '@sentinel/services';
import { toast } from 'sonner';

export function useInstructorLobby(examId: string) {
    const apiClient = useApi();
    const [isUpdatingLobbyAdmissions, setIsUpdatingLobbyAdmissions] = useState(false);
    const [lobbyAdmissions, setLobbyAdmissions] = useState<ExamLobbyWaitingStudent[]>([]);

    const refreshLobbyAdmissions = useCallback(async () => {
        try {
            const admissions = await getExamLobbyWaitingList(apiClient, examId);
            setLobbyAdmissions(admissions);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to load lobby admissions.';
            toast.error(message);
        }
    }, [apiClient, examId]);

    useEffect(() => {
        void refreshLobbyAdmissions();

        const intervalId = window.setInterval(() => {
            void refreshLobbyAdmissions();
        }, 5000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [refreshLobbyAdmissions]);

    const handleUpdateLobbyAdmissions = async (
        studentIds: string[],
        status: 'APPROVED' | 'REJECTED',
    ) => {
        if (studentIds.length === 0) {
            return;
        }

        setIsUpdatingLobbyAdmissions(true);

        try {
            const result = await updateExamLobbyAdmissions(apiClient, {
                examId,
                studentIds,
                status,
            });

            toast.success(
                `${result.updatedCount} student${result.updatedCount === 1 ? '' : 's'} ${status === 'APPROVED' ? 'updated for entry' : 'returned to the lobby queue'}.`,
            );
            await refreshLobbyAdmissions();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to update lobby admissions.';
            toast.error(message);
        } finally {
            setIsUpdatingLobbyAdmissions(false);
        }
    };

    return {
        lobbyAdmissions,
        isUpdatingLobbyAdmissions,
        refreshLobbyAdmissions,
        handleUpdateLobbyAdmissions,
    };
}
