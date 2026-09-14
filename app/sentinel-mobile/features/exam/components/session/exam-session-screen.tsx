import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useNavigation, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { CameraView } from 'expo-camera';

import { useExamSession } from '@/features/exam/hooks/session';
import { QuestionDrawer } from '@/features/exam/components/session/question-drawer';
import { SessionHeader } from './session-header';
import { QuestionCard } from './question-card';
import type { QuestionCardRenderStatus, QuestionRenderLayoutSnapshot } from './question-card';
import { SessionFooter } from './session-footer';
import { QuestionRenderClassification } from './question-render-classification';
import { ProctoringIncidentNotice } from './proctoring-incident-notice';

import { useApi, useAuth } from '@sentinel/hooks';
import {
    useMobileMediaPipeMonitoring,
    useMobileAudioAnomalyMonitoring,
    useMobileProctoringNotice,
} from '@/features/exam/hooks/monitoring';
import { MobileLiveInspectionBridge } from './mobile-live-inspection-bridge';
import { captureAndUploadEvidenceFrame } from '../../lib/mobile-frame-capture';
import { MobileMediaPipeBridge } from '../checkup/mobile-mediapipe-bridge';
import { MobileAudioBridge } from '../monitoring';

export const ExamSessionScreen = () => {
    const {
        exam,
        questions,
        currentQuestion,
        currentIndex,
        setCurrentIndex,
        answers,
        flagged,
        isDrawerOpen,
        setIsDrawerOpen,
        timeLeft,
        isLoading,
        formatTime,
        handleSelectOption,
        toggleFlag,
        handleNext,
        handlePrev,
        handleSelectQuestion,
        isLastQuestion,
    } = useExamSession();

    const { id: examId, sessionId } = useLocalSearchParams<{ id: string; sessionId: string }>();
    const apiClient = useApi();
    const { supabase, session } = useAuth();
    const cameraRef = useRef<any>(null);
    const [landmarksByFace, setLandmarksByFace] = useState<any[][]>([]);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const [rootLayout, setRootLayout] = useState<QuestionRenderLayoutSnapshot | null>(null);
    const [questionCardLayout, setQuestionCardLayout] =
        useState<QuestionRenderLayoutSnapshot | null>(null);
    const [questionCardMounted, setQuestionCardMounted] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    useEffect(() => {
        if (currentQuestion) {
            setQuestionCardMounted(true);
        }
    }, [currentQuestion?.id]);

    useEffect(() => {
        if (!__DEV__) {
            return;
        }

        console.debug('[debug][exam-question-render]', {
            questionCount: questions.length,
            currentIndex,
            hasCurrentQuestion: Boolean(currentQuestion),
            cardMounted: questionCardMounted,
            window: { width: windowWidth, height: windowHeight },
            root: rootLayout,
            viewport: questionCardLayout,
            card: questionCardLayout,
        });
    }, [
        currentIndex,
        currentQuestion,
        questionCardLayout,
        questionCardMounted,
        questions.length,
        rootLayout,
        windowHeight,
        windowWidth,
    ]);

    const handleRootLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setRootLayout({
            width: Math.round(width),
            height: Math.round(height),
        });
    }, []);

    const handleQuestionCardRenderStatus = useCallback((status: QuestionCardRenderStatus) => {
        if (status.kind === 'mounted') {
            setQuestionCardMounted(true);
            return;
        }

        setQuestionCardLayout(status.layout);
    }, []);

    const {
        activeNotice,
        dismissNotice,
        showAudioAnomalyNotice,
        showMediaPipeNotice,
    } = useMobileProctoringNotice();

    // Proctoring bridge and MediaPipe real-time monitoring
    const handleAnomaly = useCallback(
        async (eventType: 'GAZE_OFF_SCREEN' | 'MULTIPLE_FACES' | 'NO_FACE_DETECTED') => {
            showMediaPipeNotice(eventType);
            if (!exam || !sessionId || !session?.user?.id) return;
            try {
                await captureAndUploadEvidenceFrame({
                    cameraRef,
                    attemptId: sessionId,
                    examSessionId: sessionId,
                    studentId: session.user.id,
                    eventType,
                    apiClient,
                    supabase,
                });
            } catch (err) {
                console.error('Failed to capture and upload evidence frame', err);
            }
        },
        [apiClient, exam, sessionId, session?.user?.id, showMediaPipeNotice, supabase],
    );

    useMobileMediaPipeMonitoring({
        examId: typeof examId === 'string' ? examId : '',
        apiClient,
        configuration: exam?.configuration,
        mediaPipeSandbox: exam?.mediaPipeSandbox,
        examSessionId: typeof sessionId === 'string' ? sessionId : '',
        studentId: session?.user?.id,
        landmarksByFace,
        onAnomalyDetected: handleAnomaly,
    });

    const {
        isEnabled: isAudioMonitoringEnabled,
        effectiveConfig: audioEffectiveConfig,
        handleStatusChange: handleAudioStatusChange,
        handleError: handleAudioError,
        handleAnomalyDetected: handleAudioAnomalyDetected,
    } = useMobileAudioAnomalyMonitoring({
        apiClient,
        configuration: exam?.configuration,
        examSessionId: typeof sessionId === 'string' ? sessionId : '',
        studentId: session?.user?.id,
        onAnomalyDetected: (anomaly) => {
            showAudioAnomalyNotice(anomaly.anomalyType);
        },
    });

    const getLiveVideoTrack = () => {
        // Return dummy track for LiveKit publisher compatibility on mobile
        return {
            stop: () => { },
            enabled: true,
            muted: false,
        };
    };

    if (isLoading) {
        return (
            <View
                style={{ flex: 1, backgroundColor: colors.background }}
                className="items-center justify-center"
            >
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={{ color: colors.text }} className="mt-4 text-sm font-medium">
                    Loading exam session...
                </Text>
            </View>
        );
    }

    if (!exam) {
        return (
            <View
                style={{ flex: 1, backgroundColor: colors.background }}
                className="items-center justify-center"
            >
                <Text style={{ color: colors.text }}>Exam not found</Text>
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View
                style={{ flex: 1, backgroundColor: colors.background }}
                className="items-center justify-center px-8"
            >
                <Ionicons name="document-text-outline" size={56} color={colors.icon} />
                <Text
                    style={{ color: colors.text }}
                    className="mt-4 text-center text-lg font-semibold"
                >
                    No Questions Available
                </Text>
                <Text
                    style={{ color: colors.icon }}
                    className="mt-2 text-center text-sm leading-relaxed"
                >
                    This exam does not have any questions assigned yet. Please contact your instructor.
                </Text>
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
                backgroundColor: colors.background,
            }}
            onLayout={handleRootLayout}
        >
            {/* Hidden CameraView or MediaPipe Bridge for proctor streaming and image capture */}
            {exam.configuration?.cameraRequired !== false && (
                Boolean(exam.mediaPipeSandbox?.enabled && exam.mediaPipeSandbox?.emitDuringExam) ? (
                    <MobileMediaPipeBridge
                        ref={cameraRef}
                        onLandmarksDetected={(landmarks) => {
                            setLandmarksByFace(landmarks);
                        }}
                        frameIntervalMs={exam.mediaPipeSandbox?.frameIntervalMs ?? 1000}
                        facing="front"
                        showPreview={false}
                    />
                ) : (
                    <CameraView
                        ref={cameraRef}
                        facing="front"
                        style={{
                            position: 'absolute',
                            width: 1,
                            height: 1,
                            opacity: 0,
                        }}
                    />
                )
            )}

            {/* Hidden MobileAudioBridge for passive active-session audio proctoring */}
            {isAudioMonitoringEnabled && (
                <MobileAudioBridge
                    enabled={isAudioMonitoringEnabled}
                    config={audioEffectiveConfig}
                    onStatusChange={handleAudioStatusChange}
                    onError={handleAudioError}
                    onAnomalyDetected={handleAudioAnomalyDetected}
                />
            )}

            <SessionHeader
                title={exam.title}
                subject={exam.subject}
                totalQuestions={questions.length}
                currentIndex={currentIndex}
                timeLeft={timeLeft}
                formatTime={formatTime}
            />

            {/* Proctoring Incident Warning Notice */}
            <ProctoringIncidentNotice notice={activeNotice} onDismiss={dismissNotice} />

            <View style={{ flex: 1, width: '100%' }}>
                <QuestionCard
                    question={currentQuestion}
                    currentIndex={currentIndex}
                    totalQuestions={questions.length}
                    selectedOptionId={answers[currentQuestion?.id]}
                    isFlagged={!!flagged[currentQuestion?.id]}
                    onSelectOption={handleSelectOption}
                    onToggleFlag={toggleFlag}
                    onRenderStatusChange={handleQuestionCardRenderStatus}
                />
            </View>

            <QuestionRenderClassification
                colors={colors}
                questionCount={questions.length}
                currentIndex={currentIndex}
                hasCurrentQuestion={Boolean(currentQuestion)}
                cardMounted={questionCardMounted}
                rootLayout={rootLayout}
                viewportLayout={questionCardLayout}
                cardLayout={questionCardLayout}
                topOffset={insets.top + 72}
            />

            <SessionFooter
                onPrev={handlePrev}
                onNext={handleNext}
                onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
                isFirst={currentIndex === 0}
                isLast={isLastQuestion}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
            />

            {isDrawerOpen && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsDrawerOpen(false)}
                    style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
                    accessibilityLabel="Close question drawer"
                />
            )}

            <QuestionDrawer
                visible={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                questions={questions}
                currentIndex={currentIndex}
                onSelectQuestion={handleSelectQuestion}
                answers={answers as Record<string, string>}
                flaggedQuestions={flagged}
                colors={colors}
                isDark={isDark}
                bottomOffset={80 + insets.bottom}
            />

            {/* Proctor Live Viewing Stream Indicator */}
            <MobileLiveInspectionBridge
                sessionId={sessionId || null}
                attemptId={sessionId || null}
                enabled={Boolean(exam.configuration?.cameraRequired !== false)}
                mediaPipeRef={cameraRef}
                getLiveVideoTrack={getLiveVideoTrack}
            />
        </View>
    );
};
