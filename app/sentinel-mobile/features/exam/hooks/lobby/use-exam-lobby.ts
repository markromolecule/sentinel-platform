import { useCallback, useState } from 'react';
import { useColorScheme, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useApi, useAuth } from '@sentinel/hooks';
import { adaptExamForMobile } from '@/features/exam/lib/mobile-exam-adapter';
import {
    type LobbyAdmissionStatus,
    resolveLobbyAdmissionStatus,
    canEnterMobileExamLobby,
    getMobileExamLobbyEntryLabel,
    executeLobbySessionStart,
} from '@/features/exam/lib/mobile-exam-lobby';
import { useLobbyReadiness } from './use-lobby-readiness';
import { useExamLobbySync } from './use-exam-lobby-sync';

export type { LobbyAdmissionStatus } from '@/features/exam/lib/mobile-exam-lobby';
export { useLobbyReadiness } from './use-lobby-readiness';
export { useExamLobbySync } from './use-exam-lobby-sync';

export function useExamLobby() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const apiClient = useApi();
    const { session: authSession } = useAuth();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    // 1. Data synchronization, presence, and focus refetching
    const sync = useExamLobbySync({
        id,
        studentId: authSession?.user?.id,
    });

    const exam = sync.rawExam ? adaptExamForMobile(sync.rawExam) : undefined;

    // Preserve state index 0 for test compatibility
    const [isStartingSession, setIsStartingSession] = useState(false);

    const requiresMicrophone = exam?.configuration?.micRequired ?? true;
    const isMediaPipeConfigured = Boolean(
        exam?.mediaPipeSandbox?.enabled &&
        exam?.mediaPipeSandbox?.captureDuringCheckup,
    );

    // 2. Sub-hook preserves state index 1 (isMediaPipeCalibrated) and 2 (isAudioReady)
    const { isMediaPipeCalibrated, isAudioReady } = useLobbyReadiness({
        id,
        isMediaPipeConfigured,
        requiresMicrophone,
    });

    const requiresInstructorAdmission =
        exam?.configuration?.lobbyAdmissionMode === 'INSTRUCTOR_GATED';

    const admissionStatus: LobbyAdmissionStatus = resolveLobbyAdmissionStatus({
        configuration: exam?.configuration,
        admissionDataStatus: sync.admissionData?.status,
    });

    const canEnterExam = canEnterMobileExamLobby({
        runtimeAccess: exam?.runtimeAccess,
        admissionStatus,
        requiresInstructorAdmission,
        isMediaPipeCalibrated,
        isAudioReady,
    });

    const entryLabel = getMobileExamLobbyEntryLabel({
        isStartingSession,
        canEnterExam,
        runtimeAccess: exam?.runtimeAccess,
    });

    const handleGoBack = () => router.back();

    const handleEnterExam = useCallback(async () => {
        if (!exam || isStartingSession) return;

        if (!isMediaPipeCalibrated || !isAudioReady) {
            Alert.alert(
                'Checkup Incomplete',
                'Please complete the system checkup and calibration before entering the exam.',
                [{ text: 'OK' }],
            );
            return;
        }

        if (!canEnterExam) return;

        setIsStartingSession(true);
        try {
            await executeLobbySessionStart({
                apiClient,
                examId: exam.id,
                router,
            });
        } catch (err: any) {
            Alert.alert(
                'Unable to Start Exam',
                err?.message || 'Could not initialize your exam session. Please check your connection and try again.',
                [{ text: 'OK' }],
            );
        } finally {
            setIsStartingSession(false);
        }
    }, [exam, isStartingSession, isMediaPipeCalibrated, isAudioReady, canEnterExam, apiClient, router]);

    return {
        exam,
        readyCount: sync.lobbyCount?.count ?? sync.presenceCount ?? 0,
        canEnterExam,
        entryLabel,
        admissionStatus,
        colors,
        isDark,
        insets,
        isStartingSession,
        handleGoBack,
        handleEnterExam,
        isMediaPipeCalibrated,
        isAudioReady,
    };
}
