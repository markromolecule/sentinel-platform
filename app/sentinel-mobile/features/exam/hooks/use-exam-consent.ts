import { useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { mockExams } from '@/data/exams';
import { CONSENT_ITEMS } from '@/features/exam/constants';
import { type UseExamConsentReturn } from '@/types/exam';

export function useExamConsent(): UseExamConsentReturn {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const exam = mockExams.find((e) => e.id === id);
    const requiresCamera = exam?.configuration.cameraRequired ?? true;
    const requiresMicrophone = exam?.configuration.micRequired ?? true;

    const [cameraGranted, setCameraGranted] = useState(false);
    const [micGranted, setMicGranted] = useState(false);
    const [agreements, setAgreements] = useState(
        CONSENT_ITEMS.map((item) => ({ ...item, checked: false })),
    );

    const allAccepted = useMemo(() => {
        const allAgreed = agreements.every((a) => a.checked);
        const cameraReady = requiresCamera ? cameraGranted : true;
        const micReady = requiresMicrophone ? micGranted : true;
        return cameraReady && micReady && allAgreed;
    }, [agreements, cameraGranted, micGranted, requiresCamera, requiresMicrophone]);

    const toggleCamera = () => {
        if (!requiresCamera) return;
        setCameraGranted((prev) => !prev);
    };
    const toggleMic = () => {
        if (!requiresMicrophone) return;
        setMicGranted((prev) => !prev);
    };

    const toggleAgreement = (index: number) => {
        setAgreements((prev) =>
            prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)),
        );
    };

    const handleGoBack = () => router.back();

    const handleContinue = () => {
        if (!allAccepted) return;
        router.push(`/exam/${id}/checkup`);
    };

    return {
        exam,
        colors,
        isDark,
        insets,
        cameraGranted,
        micGranted,
        requiresCamera,
        requiresMicrophone,
        agreements,
        allAccepted,
        toggleCamera,
        toggleMic,
        toggleAgreement,
        handleGoBack,
        handleContinue,
    };
}
