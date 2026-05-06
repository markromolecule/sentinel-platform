import { ActivityIndicator, View, ScrollView, StatusBar, Text } from 'react-native';
import { useExamDetails } from '@/features/exam/hooks/use-exam-details';
import { HeroHeader } from '@/features/exam/components/detail/hero-header';
import { QuickInfoBar } from '@/features/exam/components/detail/quick-info-bar';
import { DifficultyBadge } from '@/features/exam/components/detail/difficulty-badge';
import { AboutSection } from '@/features/exam/components/detail/about-section';
import { InstructionsList } from '@/features/exam/components/detail/instructions-list';
import { BottomCTA } from '@/features/exam/components/detail/bottom-cta';
import { ExamNotFound } from '@/features/exam/components/detail/exam-not-found';
import { ReadOnlyExamDetails } from '@/features/exam/components/detail/read-only-exam-details';

export default function InstructionScreen() {
    const {
        exam,
        isLoading,
        canStartExam,
        startLabel,
        isReadOnlyExam,
        colors,
        isDark,
        difficultyConfig,
        insets,
        handleStartExam,
        handleOptOut,
    } = useExamDetails();

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

    if (isReadOnlyExam) {
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

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                <HeroHeader
                    exam={exam}
                    isDark={isDark}
                    colors={colors}
                    insetTop={insets.top}
                    onBack={handleOptOut}
                />

                <QuickInfoBar
                    duration={exam.duration}
                    questions={exam.questions}
                    passingPercentage={exam.passingPercentage}
                    colors={colors}
                />

                <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
                    <DifficultyBadge difficulty={exam.difficulty} config={difficultyConfig} />

                    <AboutSection description={exam.description} isDark={isDark} colors={colors} />

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 28 }} />

                    <InstructionsList
                        instructions={exam.instructions}
                        isDark={isDark}
                        colors={colors}
                    />
                </View>
            </ScrollView>

            {canStartExam ? (
                <BottomCTA colors={colors} onPress={handleStartExam} label={startLabel} />
            ) : null}
        </View>
    );
}
