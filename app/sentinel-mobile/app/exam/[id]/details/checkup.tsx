import { View, ScrollView, StatusBar, Text } from 'react-native';
import { useExamCheckup } from '@/features/exam/hooks/use-exam-checkup';
import { CheckupHeader } from '@/features/exam/components/checkup/checkup-header';
import { CameraPreview } from '@/features/exam/components/checkup/camera-preview';
import { MicLevelMeter } from '@/features/exam/components/checkup/mic-level-meter';
import { CheckupCTA } from '@/features/exam/components/checkup/checkup-cta';

function StatusRow({
    label,
    value,
    colors,
    muted,
}: {
    label: string;
    value: string;
    colors: { text: string; border: string };
    muted?: string;
}) {
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            }}
        >
            <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{label}</Text>
                {muted ? (
                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{muted}</Text>
                ) : null}
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{value}</Text>
        </View>
    );
}

export default function CheckupScreen() {
    const {
        exam,
        colors,
        isDark,
        insets,
        cameraFacing,
        cameraReady,
        micLevel,
        micDetected,
        requiresCamera,
        requiresMicrophone,
        isStartingSession,
        onCameraReady,
        flipCamera,
        handleGoBack,
        handleStartExam,
    } = useExamCheckup();

    const webOrMobileLock = exam?.configuration.mobileSecurity.prevent_backgrounding
        ? 'Locked'
        : 'Monitor only';

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
                <CheckupHeader
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
                            STEP 2 OF 2
                        </Text>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '700',
                                color: colors.text,
                                marginBottom: 6,
                            }}
                        >
                            Verify your live setup
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                lineHeight: 20,
                                color: isDark ? 'rgba(255,255,255,0.65)' : '#6b7280',
                                marginBottom: 6,
                            }}
                        >
                            Check the required sensors now. Once you enter, the exam protection
                            policy stays active.
                        </Text>
                        <StatusRow
                            label="Camera"
                            value={requiresCamera ? 'Required' : 'Optional'}
                            muted="Front-facing identity and behavior monitoring."
                            colors={colors}
                        />
                        <StatusRow
                            label="Microphone"
                            value={requiresMicrophone ? 'Required' : 'Optional'}
                            muted="Ambient audio analysis during the attempt."
                            colors={colors}
                        />
                        <StatusRow
                            label="Foreground Policy"
                            value={webOrMobileLock}
                            muted="Leaving the exam app may be blocked or flagged."
                            colors={colors}
                        />
                    </View>

                    {requiresCamera ? (
                        <CameraPreview
                            cameraFacing={cameraFacing}
                            cameraReady={cameraReady}
                            onCameraReady={onCameraReady}
                            onFlip={flipCamera}
                            colors={colors}
                            isDark={isDark}
                        />
                    ) : null}

                    {requiresMicrophone ? (
                        <MicLevelMeter
                            level={micLevel}
                            detected={micDetected}
                            colors={colors}
                            isDark={isDark}
                        />
                    ) : null}
                </View>
            </ScrollView>

            <CheckupCTA colors={colors} isLoading={isStartingSession} onPress={handleStartExam} />
        </View>
    );
}
