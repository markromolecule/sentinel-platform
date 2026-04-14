import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Alert, AppState } from 'react-native';
import { mockExams } from '@/data/exams';
import { mockQuestions } from '@/data/questions';
import { emitMobileTelemetryEvent } from '@/features/exam/lib/mobile-telemetry-client';

export const useExamSession = () => {
    const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId: string }>();
    const router = useRouter();
    const navigation = useNavigation();

    // Data
    const exam = useMemo(() => mockExams.find((e) => e.id === id), [id]);
    const questions = useMemo(() => mockQuestions.filter((q) => q.examId === id), [id]);

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flagged, setFlagged] = useState<Record<string, boolean>>({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState((exam?.duration || 60) * 60);
    const appStateRef = useRef(AppState.currentState);
    const lastNotificationViolationAtRef = useRef(0);

    // Helpers
    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const emitSessionTelemetry = useCallback(
        (
            eventType:
                | 'APP_BACKGROUNDING'
                | 'APP_PINNING_VIOLATION'
                | 'NOTIFICATION_BLOCK_VIOLATION',
        ) => {
            if (!exam || !sessionId) {
                return;
            }

            void emitMobileTelemetryEvent({
                configuration: exam.configuration,
                examSessionId: sessionId,
                eventType,
            }).catch((error) => {
                console.warn('Failed to emit mobile telemetry event.', {
                    eventType,
                    error,
                });
            });
        },
        [exam, sessionId],
    );

    // Timer
    useEffect(() => {
        if (!exam) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Auto-submit logic
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [exam]);

    useEffect(() => {
        const configuration = exam?.configuration.mobileSecurity;

        if (!configuration) {
            return;
        }

        const subscription = AppState.addEventListener('change', (nextState) => {
            const wasActive = appStateRef.current === 'active';
            const movedAwayFromExam = nextState === 'inactive' || nextState === 'background';

            if (wasActive && movedAwayFromExam) {
                if (configuration.prevent_backgrounding) {
                    emitSessionTelemetry('APP_BACKGROUNDING');
                }

                if (configuration.app_pinning_required) {
                    emitSessionTelemetry('APP_PINNING_VIOLATION');
                }

                if (configuration.notification_block && nextState === 'inactive') {
                    emitSessionTelemetry('NOTIFICATION_BLOCK_VIOLATION');
                    lastNotificationViolationAtRef.current = Date.now();
                }

                Alert.alert(
                    'Focus Required',
                    'Leaving the exam app is prohibited and may be flagged by the security policy.',
                );
            }

            appStateRef.current = nextState;
        });

        const blurSubscription = AppState.addEventListener('blur', () => {
            if (!configuration.notification_block) {
                return;
            }

            const now = Date.now();
            if (now - lastNotificationViolationAtRef.current < 1000) {
                return;
            }

            lastNotificationViolationAtRef.current = now;
            emitSessionTelemetry('NOTIFICATION_BLOCK_VIOLATION');
        });

        return () => {
            subscription.remove();
            blurSubscription.remove();
        };
    }, [emitSessionTelemetry, exam?.configuration.mobileSecurity]);

    // Handlers
    const handleSelectOption = (optionId: string) => {
        if (!currentQuestion) return;
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    };

    const toggleFlag = () => {
        if (!currentQuestion) return;
        setFlagged((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            const unansweredCount = questions.filter((q) => !answers[q.id]).length;
            const flaggedCount = Object.values(flagged).filter(Boolean).length;

            let message = 'Are you sure you want to submit?';
            if (unansweredCount > 0 || flaggedCount > 0) {
                message = `You have ${unansweredCount} unanswered and ${flaggedCount} flagged questions. Are you sure you want to submit?`;
            }

            Alert.alert(
                unansweredCount > 0 || flaggedCount > 0
                    ? 'Missing or Flagged Questions'
                    : 'Submit Exam',
                message,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Submit',
                        style: 'destructive',
                        onPress: () => {
                            console.log('Exam submitted:', { answers, sessionId });
                            router.replace('/(tabs)/exam');
                        },
                    },
                ],
            );
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
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
        formatTime,
        handleSelectOption,
        toggleFlag,
        handleNext,
        handlePrev,
        isLastQuestion,
    };
};
