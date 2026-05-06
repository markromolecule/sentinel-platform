import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useExamDetails } from '@/features/exam/hooks/use-exam-details';
import { ExamNotFound } from '@/features/exam/components/detail/exam-not-found';
import { ReadOnlyExamDetails } from '@/features/exam/components/detail/read-only-exam-details';

export default function ExamIdIndex() {
    const { exam, isLoading, isReadOnlyExam, colors, isDark, insets, handleOptOut } =
        useExamDetails();

    if (isLoading) {
        return (
            <View
                style={{ flex: 1, backgroundColor: colors.background }}
                className="items-center justify-center"
            >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="mt-4 text-sm font-medium" style={{ color: colors.icon }}>
                    Loading exam details...
                </Text>
            </View>
        );
    }

    if (!exam) {
        return <ExamNotFound colors={colors} onGoBack={handleOptOut} />;
    }

    if (!isReadOnlyExam) {
        return <Redirect href={`/exam/${exam.id}/instruction`} />;
    }

    return (
        <ReadOnlyExamDetails
            exam={exam}
            colors={colors}
            isDark={isDark}
            insetTop={insets.top}
            onBack={handleOptOut}
        />
    );
}
