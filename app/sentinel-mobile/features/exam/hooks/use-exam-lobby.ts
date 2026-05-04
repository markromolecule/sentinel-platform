import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { mockExams } from '@/data/exams';
import { startMobileExamSession } from '@/features/exam/lib/mobile-exam-session';

export function useExamLobby() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const exam = mockExams.find((e) => e.id === id);
    const [isStartingSession, setIsStartingSession] = useState(false);

    const handleGoBack = () => router.back();

    const handleEnterExam = async () => {
        if (!exam || isStartingSession) {
            return;
        }

        setIsStartingSession(true);

        try {
            const session = await startMobileExamSession(exam);

            console.log('Navigating to exam session:', {
                sessionId: session.sessionId,
                mode: session.mode,
            });

            router.replace(`/exam/${id}/session/${session.sessionId}`);
        } finally {
            setIsStartingSession(false);
        }
    };

    return {
        exam,
        colors,
        isDark,
        insets,
        isStartingSession,
        handleGoBack,
        handleEnterExam,
    };
}
