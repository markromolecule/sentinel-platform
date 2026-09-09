import { useEffect, useState } from 'react';
import { useColorScheme, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useApi, useExamQuery } from '@sentinel/hooks';
import { completeExamSession } from '@sentinel/services';
import {
    adaptExamForMobile,
    adaptExamQuestionsForMobile,
} from '@/features/exam/lib/mobile-exam-adapter';
import {
    clearStoredMobileExamPreview,
    clearStoredMobileExamSession,
    readStoredMobileExamPreview,
} from '@/features/exam/lib/mobile-exam-storage';

export function useExamResult() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const apiClient = useApi();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const { data: rawExam } = useExamQuery(id, { viewer: 'student' });
    const exam = rawExam ? adaptExamForMobile(rawExam) : undefined;
    const questions = rawExam ? adaptExamQuestionsForMobile(rawExam) : [];
    const [preview, setPreview] =
        useState<Awaited<ReturnType<typeof readStoredMobileExamPreview>>>(null);

    const [isTurningIn, setIsTurningIn] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }

        void readStoredMobileExamPreview(id).then(setPreview);
    }, [id]);

    const handleTurnIn = async () => {
        if (!preview || !id) {
            return;
        }

        setIsTurningIn(true);

        try {
            // Only call completeExamSession if the attempt hasn't already been
            // submitted during the session finish flow. If preview.completedAt or
            // preview.summary?.completedAt exists, the server already has the answers
            // and the attempt is persisted — skip the duplicate mutation.
            if (!preview.completedAt && !preview.summary?.completedAt) {
                await completeExamSession(apiClient, {
                    sessionId: preview.sessionId,
                    answers: preview.answers,
                    elapsedSeconds: preview.elapsedSeconds,
                });
            }

            const sessionId = preview.sessionId;
            await clearStoredMobileExamPreview(id);
            await clearStoredMobileExamSession(id);

            setIsTurningIn(false);
            router.replace({
                pathname: '/exam/[id]/feedback',
                params: { id, attemptId: sessionId },
            });
        } catch (error: any) {
            // If the session was already completed/submitted on the server (409 Conflict),
            // treat as success, clean local cache, and seamlessly proceed to feedback.
            const isAlreadySubmitted =
                error?.status === 409 ||
                error?.statusCode === 409 ||
                error?.response?.status === 409 ||
                /already.*submitted/i.test(error?.message || '') ||
                /already.*submitted/i.test(error?.response?.data?.message || '');

            if (isAlreadySubmitted) {
                const sessionId = preview.sessionId;
                await clearStoredMobileExamPreview(id);
                await clearStoredMobileExamSession(id);

                setIsTurningIn(false);
                router.replace({
                    pathname: '/exam/[id]/feedback',
                    params: { id, attemptId: sessionId },
                });
                return;
            }

            setIsTurningIn(false);
            Alert.alert('Turn-in failed', error?.message || 'Please try again.');
        }
    };

    return {
        exam,
        questions,
        summary: preview?.summary ?? {
            score: 0,
            totalScore: 0,
            percentage: null,
            answeredCount: 0,
            autoGradableQuestionCount: 0,
            manualReviewQuestionCount: 0,
            requiresManualReview: false,
        },
        answers: preview?.answers ?? {},
        colors,
        isDark,
        insets,
        isTurningIn,
        handleTurnIn,
    };
}
