import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { useApi, useExamLobbyCountQuery, useExamQuery } from '@sentinel/hooks';
import {
    checkIntoExamLobby,
    getExamLobbyAdmissionStatus,
    startExamSession,
} from '@sentinel/services';
import { adaptExamForMobile } from '@/features/exam/lib/mobile-exam-adapter';
import { getMobileExamLobbyEntryLabel } from '@/features/exam/lib/mobile-exam-lobby';
import { writeStoredMobileExamSession } from '@/features/exam/lib/mobile-exam-storage';

export function useExamLobby() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const apiClient = useApi();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const { data: rawExam, refetch: refetchExam } = useExamQuery(id);
    const { data: lobbyCount, refetch: refetchLobbyCount } = useExamLobbyCountQuery(id);
    const exam = rawExam ? adaptExamForMobile(rawExam) : undefined;
    const [isStartingSession, setIsStartingSession] = useState(false);
    const canEnterExam = Boolean(exam?.runtimeAccess?.canStart || exam?.runtimeAccess?.canResume);
    const entryLabel = getMobileExamLobbyEntryLabel({
        isStartingSession,
        canEnterExam,
        runtimeAccess: exam?.runtimeAccess,
    });

    const handleGoBack = () => router.back();

    const handleEnterExam = async () => {
        if (!exam || isStartingSession) {
            return;
        }

        if (!canEnterExam) {
            return;
        }

        setIsStartingSession(true);

        try {
            const session = await startExamSession(apiClient, {
                examId: exam.id,
            });

            if (!session.sessionId) {
                throw new Error(session.error || 'Exam session could not be initialized.');
            }

            await writeStoredMobileExamSession({
                examId: exam.id,
                sessionId: session.sessionId,
                isResumed: Boolean(session.isResumed),
            });

            router.replace(`/exam/${id}/session/${session.sessionId}`);
        } finally {
            setIsStartingSession(false);
        }
    };

    useEffect(() => {
        if (!id) {
            return;
        }

        void checkIntoExamLobby(apiClient, id)
            .then(async () => {
                await refetchExam();
            })
            .catch(async () => {
                await getExamLobbyAdmissionStatus(apiClient, id).catch(() => null);
                await refetchExam();
            });
    }, [apiClient, id, refetchExam]);

    useEffect(() => {
        if (!id || canEnterExam) {
            return;
        }

        const interval = setInterval(() => {
            void getExamLobbyAdmissionStatus(apiClient, id)
                .catch(() => null)
                .finally(() => {
                    void refetchExam();
                    void refetchLobbyCount();
                });
        }, 3000);

        return () => clearInterval(interval);
    }, [apiClient, canEnterExam, id, refetchExam, refetchLobbyCount]);

    useFocusEffect(
        useCallback(() => {
            if (!id) {
                return undefined;
            }

            void getExamLobbyAdmissionStatus(apiClient, id)
                .catch(() => null)
                .finally(() => {
                    void refetchExam();
                    void refetchLobbyCount();
                });

            return undefined;
        }, [apiClient, id, refetchExam, refetchLobbyCount]),
    );

    return {
        exam,
        readyCount: lobbyCount?.count ?? 0,
        canEnterExam,
        entryLabel,
        colors,
        isDark,
        insets,
        isStartingSession,
        handleGoBack,
        handleEnterExam,
    };
}
