import { useColorScheme, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth, useExamQuery } from '@sentinel/hooks';
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY_CONFIG } from '@/features/exam/constants';
import { type UseExamDetailsReturn } from '@/types/exam';
import { adaptExamForMobile } from '@/features/exam/lib/mobile-exam-adapter';
import { isReadOnlyMobileExamStatus } from '@/features/exam/lib/mobile-exam-actions';
import { shouldShowExamDetailsLoading } from '@/features/exam/lib/mobile-exam-details-state';

export function useExamDetails(): UseExamDetailsReturn {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isLoading: isAuthLoading } = useAuth();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const {
        data: rawExam,
        isError,
        isFetching,
        isPending,
    } = useExamQuery(typeof id === 'string' ? id : undefined);
    const exam = rawExam ? adaptExamForMobile(rawExam) : undefined;
    const isLoading = shouldShowExamDetailsLoading({
        isAuthLoading,
        isPending,
        isFetching,
        hasRawExam: Boolean(rawExam),
    });
    const isReadOnlyExam = exam ? isReadOnlyMobileExamStatus(exam.status) : false;
    const canStartExam =
        (exam?.status === 'available' || exam?.status === 'in-progress') &&
        !isReadOnlyExam &&
        (exam.runtimeAccess
            ? exam.runtimeAccess.state !== 'locked' && exam.runtimeAccess.state !== 'closed'
            : true);

    const startLabel = exam?.status === 'in-progress' ? 'Resume Exam' : 'Continue to Privacy';

    const difficultyConfig = exam
        ? (DIFFICULTY_CONFIG[exam.difficulty] ??
          DEFAULT_DIFFICULTY_CONFIG(colors.icon, colors.input))
        : DEFAULT_DIFFICULTY_CONFIG(colors.icon, colors.input);

    const handleStartExam = () => {
        if (!exam || !canStartExam) return;
        router.push(`/exam/${id}/privacy`);
    };

    const handleOptOut = () => {
        Alert.alert('Leave Exam', 'Are you sure you want to leave? You can come back anytime.', [
            { text: 'Stay', style: 'cancel' },
            {
                text: 'Leave',
                style: 'destructive',
                onPress: () => router.back(),
            },
        ]);
    };

    return {
        exam,
        isLoading,
        isError,
        canStartExam,
        startLabel,
        isReadOnlyExam,
        colors,
        isDark,
        difficultyConfig,
        insets,
        handleStartExam,
        handleOptOut,
    };
}
