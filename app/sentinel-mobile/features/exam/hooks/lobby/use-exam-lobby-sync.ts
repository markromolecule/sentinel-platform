import { useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    useExamLobbyCountQuery,
    useExamQuery,
    useExamLobbyAdmissionStatusQuery,
    useExamLobbyBootstrapMutation,
    useLobbyRealtime,
} from '@sentinel/hooks';

export interface UseExamLobbySyncOptions {
    id?: string;
    studentId?: string;
}

export interface UseExamLobbySyncReturn {
    rawExam: any;
    lobbyCount: { count?: number } | undefined;
    presenceCount: number | undefined;
    admissionData: { status?: any } | undefined;
    refetchExam: () => Promise<any>;
    refetchLobbyCount: () => Promise<any>;
    refetchAdmissionStatus: () => Promise<any>;
}

/**
 * Encapsulates exam lobby data synchronization, atomic bootstrap check-in,
 * Supabase realtime presence tracking, and focus-based state refetching.
 */
export function useExamLobbySync({
    id,
    studentId,
}: UseExamLobbySyncOptions): UseExamLobbySyncReturn {
    const { data: rawExam, refetch: refetchExam } = useExamQuery(id);
    const { data: lobbyCount, refetch: refetchLobbyCount } = useExamLobbyCountQuery(id);
    const {
        data: admissionData,
        refetch: refetchAdmissionStatus,
    } = useExamLobbyAdmissionStatusQuery(id);

    const { mutate: bootstrapLobby } = useExamLobbyBootstrapMutation({
        onSuccess: (data) => {
            if (data.admission?.status === 'APPROVED') {
                void refetchExam();
            }
        },
    });

    // Initial atomic bootstrap on mount (check-in, exam metadata, config & admissions in 1 query)
    useEffect(() => {
        if (!id) return;
        bootstrapLobby(id);
    }, [bootstrapLobby, id]);

    // Real-time broadcast and presence tracking via consolidated useLobbyRealtime
    const { presenceCount } = useLobbyRealtime({
        examId: typeof id === 'string' ? id : '',
        studentId,
        enabled: Boolean(id),
        trackPresence: true,
        onAdmissionChange: () => {
            void refetchAdmissionStatus();
            void refetchExam();
            void refetchLobbyCount();
        },
    });

    useFocusEffect(
        useCallback(() => {
            if (!id) return undefined;

            void Promise.allSettled([
                refetchAdmissionStatus(),
                refetchExam(),
                refetchLobbyCount(),
            ]);

            return undefined;
        }, [id, refetchAdmissionStatus, refetchExam, refetchLobbyCount]),
    );

    return {
        rawExam,
        lobbyCount,
        presenceCount,
        admissionData,
        refetchExam,
        refetchLobbyCount,
        refetchAdmissionStatus,
    };
}
