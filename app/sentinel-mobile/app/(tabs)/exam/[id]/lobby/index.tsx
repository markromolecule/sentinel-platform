import { View, ScrollView, StatusBar, Text } from 'react-native';
import { useExamLobby } from '@/features/exam/hooks/use-exam-lobby';
import { HeroHeader } from '@/features/exam/components/detail/hero-header';
import { BottomCTA } from '@/features/exam/components/detail/bottom-cta';
import { Ionicons } from '@expo/vector-icons';

export default function LobbyScreen() {
    const { exam, colors, isDark, insets, isStartingSession, handleGoBack, handleEnterExam } =
        useExamLobby();

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
                    onBack={handleGoBack}
                />

                <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 24,
                            padding: 24,
                            backgroundColor: colors.card,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.05,
                            shadowRadius: 12,
                            elevation: 2,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '700',
                                letterSpacing: 1,
                                color: colors.primary,
                                marginBottom: 8,
                            }}
                        >
                            STEP 4 OF 4
                        </Text>
                        <View className="items-center mb-6">
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    backgroundColor: colors.primary + '10',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 16,
                                }}
                            >
                                <Ionicons name="time" size={32} color={colors.primary} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: '700',
                                    color: colors.text,
                                    textAlign: 'center',
                                }}
                            >
                                Waiting for Entry
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: isDark ? 'rgba(255,255,255,0.6)' : '#6b7280',
                                    textAlign: 'center',
                                    marginTop: 4,
                                }}
                            >
                                The exam is ready. You can enter when you're prepared.
                            </Text>
                        </View>

                        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />

                        <View className="space-y-4 pt-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="people" size={20} color={colors.icon} />
                                    <Text
                                        style={{ marginLeft: 12, color: colors.text, fontSize: 15 }}
                                    >
                                        Other Students
                                    </Text>
                                </View>
                                <Text style={{ fontWeight: '700', color: colors.primary }}>12</Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="shield-checkmark" size={20} color={colors.icon} />
                                    <Text
                                        style={{ marginLeft: 12, color: colors.text, fontSize: 15 }}
                                    >
                                        Security Status
                                    </Text>
                                </View>
                                <Text style={{ fontWeight: '700', color: '#10b981' }}>Active</Text>
                            </View>
                        </View>
                    </View>

                    <View className="mt-8 px-4">
                        <View className="flex-row items-start space-x-3 mb-6">
                            <Ionicons name="alert-circle" size={20} color={colors.primary} />
                            <Text
                                style={{
                                    flex: 1,
                                    fontSize: 13,
                                    lineHeight: 18,
                                    color: isDark ? 'rgba(255,255,255,0.5)' : '#6b7280',
                                }}
                            >
                                Note: Once you enter, the timer will start immediately and you must
                                stay within the application.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <BottomCTA
                colors={colors}
                onPress={handleEnterExam}
                label={isStartingSession ? 'Entering...' : 'Enter Exam'}
            />
        </View>
    );
}
