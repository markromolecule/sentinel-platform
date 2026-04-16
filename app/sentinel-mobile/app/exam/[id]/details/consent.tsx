import { View, ScrollView, StatusBar, Text } from 'react-native';
import { useExamConsent } from '@/features/exam/hooks/use-exam-consent';
import { ConsentHeader } from '@/features/exam/components/consent/consent-header';
import { PermissionCard } from '@/features/exam/components/consent/permission-card';
import { ConsentAgreements } from '@/features/exam/components/consent/consent-agreements';
import { ConsentCTA } from '@/features/exam/components/consent/consent-cta';

function PolicyPill({
    label,
    colors,
    isDark,
}: {
    label: string;
    colors: { border: string; text: string; card: string };
    isDark: boolean;
}) {
    return (
        <View
            style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.card,
            }}
        >
            <Text
                style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.text,
                }}
            >
                {label}
            </Text>
        </View>
    );
}

export default function ConsentScreen() {
    const {
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
    } = useExamConsent();

    const policyItems = [
        requiresCamera ? 'Camera required' : 'Camera optional',
        requiresMicrophone ? 'Microphone required' : 'Microphone optional',
        exam?.configuration.mobileSecurity.app_pinning_required ? 'App pinning' : null,
        exam?.configuration.mobileSecurity.prevent_backgrounding ? 'Stay in app' : null,
        exam?.configuration.mobileSecurity.screenshot_block ? 'Screenshots blocked' : null,
    ].filter(Boolean) as string[];

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
                <ConsentHeader
                    examTitle={exam?.title ?? 'Exam'}
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
                            borderRadius: 20,
                            padding: 18,
                            marginBottom: 22,
                            backgroundColor: colors.card,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '700',
                                letterSpacing: 1,
                                color: colors.icon,
                                marginBottom: 8,
                            }}
                        >
                            STEP 1 OF 2
                        </Text>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '700',
                                color: colors.text,
                                marginBottom: 6,
                            }}
                        >
                            Review the exam policy
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                lineHeight: 20,
                                color: isDark ? 'rgba(255,255,255,0.65)' : '#6b7280',
                                marginBottom: 14,
                            }}
                        >
                            Confirm the permissions and the mobile protections that will stay active
                            during the session.
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {policyItems.map((item) => (
                                <PolicyPill
                                    key={item}
                                    label={item}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            ))}
                        </View>
                    </View>

                    {requiresCamera ? (
                        <PermissionCard
                            icon="camera"
                            title="Camera Access"
                            description="Your camera will be used for identity verification and proctoring during the exam."
                            granted={cameraGranted}
                            onToggle={toggleCamera}
                            colors={colors}
                            isDark={isDark}
                        />
                    ) : null}

                    {requiresMicrophone ? (
                        <PermissionCard
                            icon="mic"
                            title="Microphone Access"
                            description="Your microphone will be monitored to ensure exam integrity and detect irregularities."
                            granted={micGranted}
                            onToggle={toggleMic}
                            colors={colors}
                            isDark={isDark}
                        />
                    ) : null}

                    <View
                        style={{ height: 1, backgroundColor: colors.border, marginVertical: 24 }}
                    />

                    <ConsentAgreements
                        agreements={agreements}
                        onToggle={toggleAgreement}
                        colors={colors}
                        isDark={isDark}
                    />
                </View>
            </ScrollView>

            <ConsentCTA colors={colors} enabled={allAccepted} onPress={handleContinue} />
        </View>
    );
}
