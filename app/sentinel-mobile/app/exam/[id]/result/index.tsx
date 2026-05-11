import { View, ScrollView, StatusBar, Text } from 'react-native';
import { useExamResult } from '@/features/exam/hooks/use-exam-result';
import { HeroHeader } from '@/features/exam/components/detail/hero-header';
import { BottomCTA } from '@/features/exam/components/detail/bottom-cta';
import { Ionicons } from '@expo/vector-icons';

export default function ResultScreen() {
    const { exam, summary, colors, isDark, insets, isTurningIn, handleTurnIn } = useExamResult();

    if (!exam) return null;

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
                    onBack={() => {}} // Usually can't go back from result easily
                />

                <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#ecfdf5',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            alignSelf: 'flex-start',
                            marginBottom: 20,
                            borderWidth: 1,
                            borderColor: '#10b98120',
                        }}
                    >
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text
                            style={{
                                marginLeft: 6,
                                fontSize: 11,
                                fontWeight: '700',
                                color: '#059669',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}
                        >
                            Ready to Turn In
                        </Text>
                    </View>

                    <Text
                        style={{
                            fontSize: 24,
                            fontWeight: '700',
                            color: colors.text,
                            marginBottom: 8,
                        }}
                    >
                        Summary
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            lineHeight: 20,
                            color: isDark ? 'rgba(255,255,255,0.6)' : '#6b7280',
                            marginBottom: 24,
                        }}
                    >
                        Review your computed score before you finalize the attempt. Once you turn
                        in, your session will be closed.
                    </Text>

                    <View className="-mx-2 flex-row flex-wrap">
                        <View className="w-1/2 p-2">
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 20,
                                    padding: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Score
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontWeight: '700',
                                        color: colors.text,
                                        marginTop: 8,
                                    }}
                                >
                                    {summary.score}
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '400',
                                            color: '#9ca3af',
                                        }}
                                    >
                                        {' '}
                                        / {summary.totalScore}
                                    </Text>
                                </Text>
                            </View>
                        </View>
                        <View className="w-1/2 p-2">
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 20,
                                    padding: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Grade
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontWeight: '700',
                                        color: colors.text,
                                        marginTop: 8,
                                    }}
                                >
                                    {summary.percentage}%
                                </Text>
                            </View>
                        </View>
                        <View className="w-1/2 p-2">
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 20,
                                    padding: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Answered
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontWeight: '700',
                                        color: colors.text,
                                        marginTop: 8,
                                    }}
                                >
                                    {summary.answeredCount}
                                </Text>
                            </View>
                        </View>
                        <View className="w-1/2 p-2">
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 20,
                                    padding: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Review
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontWeight: '700',
                                        color: colors.text,
                                        marginTop: 8,
                                    }}
                                >
                                    {summary.manualReviewQuestionCount}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View
                        style={{
                            marginTop: 16,
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 20,
                            padding: 20,
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                            Turn-In Notes
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                lineHeight: 22,
                                color: isDark ? 'rgba(255,255,255,0.6)' : '#4b5563',
                                marginTop: 8,
                            }}
                        >
                            This is the final auto-graded summary. Objective items are scored now.
                            Manual review items remain provisional until grading is completed.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <BottomCTA
                colors={colors}
                onPress={handleTurnIn}
                label={isTurningIn ? 'Turning In...' : 'Turn In'}
            />
        </View>
    );
}
