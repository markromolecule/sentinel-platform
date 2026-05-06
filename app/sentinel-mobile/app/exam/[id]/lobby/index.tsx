import { View, ScrollView, StatusBar, Text } from 'react-native';
import { useExamLobby } from '@/features/exam/hooks/use-exam-lobby';
import { HeroHeader } from '@/features/exam/components/detail/hero-header';
import { BottomCTA } from '@/features/exam/components/detail/bottom-cta';
import { Ionicons } from '@expo/vector-icons';

export default function LobbyScreen() {
    const {
        exam,
        readyCount,
        canEnterExam,
        colors,
        isDark,
        insets,
        isStartingSession,
        handleGoBack,
        handleEnterExam,
    } =
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

                <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
                    <View style={{ marginBottom: 24 }}>
                        <View className="items-center mb-12">
                            <View
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 24,
                                    borderWidth: 2,
                                    borderColor: colors.primary + '15',
                                }}
                            >
                                <View
                                    style={{
                                        width: 76,
                                        height: 76,
                                        borderRadius: 38,
                                        backgroundColor: colors.primary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: colors.primary,
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 10,
                                        elevation: 10,
                                    }}
                                >
                                    <Ionicons name="time" size={38} color="#fff" />
                                </View>
                            </View>
                            <Text
                                style={{
                                    fontSize: 26,
                                    fontWeight: '800',
                                    color: colors.text,
                                    textAlign: 'center',
                                    letterSpacing: -0.5,
                                }}
                            >
                                Waiting for Entry
                            </Text>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                                    textAlign: 'center',
                                    marginTop: 10,
                                    paddingHorizontal: 30,
                                    lineHeight: 22,
                                }}
                            >
                                The proctor is preparing the session. You can enter when the button becomes active.
                            </Text>
                        </View>

                        <View
                            style={{
                                backgroundColor: colors.card,
                                borderRadius: 24,
                                padding: 24,
                                borderWidth: 1,
                                borderColor: colors.border,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.04,
                                shadowRadius: 12,
                                elevation: 3,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center">
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 12,
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 14,
                                        }}
                                    >
                                        <Ionicons name="people" size={20} color={colors.primary} />
                                    </View>
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: 16,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Other Students
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: colors.primary + '15',
                                        paddingHorizontal: 12,
                                        paddingVertical: 4,
                                        borderRadius: 8,
                                    }}
                                >
                                <Text style={{ fontWeight: '700', color: colors.primary, fontSize: 14 }}>
                                        {readyCount}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 12,
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 14,
                                        }}
                                    >
                                        <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                                    </View>
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: 16,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Security Status
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: '#10b98115',
                                        paddingHorizontal: 12,
                                        paddingVertical: 4,
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text style={{ fontWeight: '700', color: '#10b981', fontSize: 14 }}>
                                        {exam.runtimeAccess?.canStart || exam.runtimeAccess?.canResume
                                            ? 'Approved'
                                            : exam.runtimeAccess?.state === 'lobby_waiting'
                                              ? 'Waiting'
                                              : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View
                        style={{
                            marginTop: 16,
                            padding: 16,
                            borderRadius: 16,
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : '#f0f7ff',
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#e0f0ff',
                        }}
                    >
                        <Ionicons
                            name="information-circle"
                            size={22}
                            color={colors.primary}
                            style={{ marginRight: 12 }}
                        />
                        <Text
                            style={{
                                flex: 1,
                                fontSize: 13,
                                lineHeight: 18,
                                color: isDark ? 'rgba(255,255,255,0.6)' : '#3b82f6',
                                fontWeight: '500',
                            }}
                        >
                            Note: Once you enter, the timer will start immediately and you must stay within the app.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <BottomCTA
                colors={colors}
                onPress={handleEnterExam}
                label={
                    isStartingSession
                        ? 'Entering...'
                        : exam.runtimeAccess?.canResume
                          ? 'Resume Exam'
                          : exam.runtimeAccess?.state === 'lobby_waiting'
                            ? 'Waiting for Approval'
                            : exam.runtimeAccess?.state === 'before_start'
                              ? 'Awaiting Start Time'
                              : exam.runtimeAccess?.state === 'closed'
                                ? 'Exam Closed'
                                : exam.runtimeAccess?.state === 'locked'
                                  ? 'Exam Locked'
                          : 'Enter Exam'
                }
                disabled={!canEnterExam || isStartingSession}
            />
        </View>
    );
}
