import { useState, useMemo } from 'react';
import { useColorScheme, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { mockExams } from '@/data/exams';
import { mockQuestions } from '@/data/questions';

export function useExamResult() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const exam = mockExams.find((e) => e.id === id);
    const questions = mockQuestions.filter((q) => q.examId === id);

    // In a real app, these would come from local storage or navigation params
    // For now, we'll simulate some results
    const summary = useMemo(() => {
        const totalScore = questions.length;
        const answeredCount = Math.floor(totalScore * 0.9); // Simulate 90% answered
        const score = Math.floor(answeredCount * 0.85); // Simulate 85% correct
        const percentage = Math.round((score / totalScore) * 100);

        return {
            score,
            totalScore,
            percentage,
            answeredCount,
            manualReviewQuestionCount: 0,
            autoGradableQuestionCount: totalScore,
        };
    }, [questions]);

    const [isTurningIn, setIsTurningIn] = useState(false);

    const handleTurnIn = async () => {
        setIsTurningIn(true);
        // Simulate API call
        setTimeout(() => {
            setIsTurningIn(false);
            Alert.alert('Success', 'Exam turned in successfully.', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/exam'),
                },
            ]);
        }, 1500);
    };

    return {
        exam,
        summary,
        colors,
        isDark,
        insets,
        isTurningIn,
        handleTurnIn,
    };
}
