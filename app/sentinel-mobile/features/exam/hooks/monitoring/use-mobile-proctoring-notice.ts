import { useState, useCallback, useRef, useEffect } from 'react';
import type { AudioAnomalyType } from '@sentinel/shared';
import type { MediaPipeIncidentSignal, MediaPipeWarningStatus } from '@/features/exam/lib/mobile-mediapipe-incident';

export type ProctoringNoticeCategory = 'audio' | 'video';

export interface ProctoringNotice {
    id: string;
    category: ProctoringNoticeCategory;
    message: string;
    timestamp: number;
}

export const AUDIO_ANOMALY_STUDENT_MESSAGES: Record<AudioAnomalyType, string> = {
    TALKING: 'Speaking detected. Please maintain silence during the exam.',
    BACKGROUND_NOISE: 'Background noise detected. Please ensure a quiet testing area.',
    TYPING: 'Typing sounds detected. Please avoid external devices.',
    TAPPING: 'Tapping sounds detected. Please focus on your exam.',
    MOUTH_BREATHING: 'Heavy breathing detected. Please focus on your exam.',
    SILENCE_DETECTED: 'Microphone silence detected. Please ensure your microphone is working.',
};

export const MEDIAPIPE_STUDENT_MESSAGES: Record<MediaPipeIncidentSignal, string> = {
    GAZE_OFF_SCREEN: 'Looking away from screen. Please stay focused on your exam.',
    MULTIPLE_FACES: 'Multiple people detected. Please ensure you are taking the exam alone.',
    NO_FACE_DETECTED: 'Face not detected. Please ensure your camera clearly frames your face.',
};

export interface UseMobileProctoringNoticeOptions {
    autoDismissMs?: number;
}

export interface UseMobileProctoringNoticeResult {
    activeNotice: ProctoringNotice | null;
    showNotice: (category: ProctoringNoticeCategory, message: string) => void;
    showAudioAnomalyNotice: (anomalyType: AudioAnomalyType) => void;
    showMediaPipeNotice: (signalOrWarning: MediaPipeIncidentSignal | MediaPipeWarningStatus | string) => void;
    dismissNotice: () => void;
}

/**
 * Custom hook providing a coalescing, non-blocking notice presentation state
 * for student-facing proctoring warnings (audio anomalies and camera events).
 */
export function useMobileProctoringNotice(
    options: UseMobileProctoringNoticeOptions = {},
): UseMobileProctoringNoticeResult {
    const { autoDismissMs = 6000 } = options;
    const [activeNotice, setActiveNotice] = useState<ProctoringNotice | null>(null);
    const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearDismissTimer = useCallback(() => {
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
            dismissTimerRef.current = null;
        }
    }, []);

    const dismissNotice = useCallback(() => {
        clearDismissTimer();
        setActiveNotice(null);
    }, [clearDismissTimer]);

    const showNotice = useCallback(
        (category: ProctoringNoticeCategory, message: string) => {
            clearDismissTimer();
            const notice: ProctoringNotice = {
                id: `${category}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                category,
                message,
                timestamp: Date.now(),
            };
            setActiveNotice(notice);

            if (autoDismissMs > 0) {
                dismissTimerRef.current = setTimeout(() => {
                    setActiveNotice(null);
                    dismissTimerRef.current = null;
                }, autoDismissMs);
            }
        },
        [autoDismissMs, clearDismissTimer],
    );

    const showAudioAnomalyNotice = useCallback(
        (anomalyType: AudioAnomalyType) => {
            const message =
                AUDIO_ANOMALY_STUDENT_MESSAGES[anomalyType] ??
                'Sound detected. Please maintain exam silence.';
            showNotice('audio', message);
        },
        [showNotice],
    );

    const showMediaPipeNotice = useCallback(
        (signalOrWarning: MediaPipeIncidentSignal | MediaPipeWarningStatus | string) => {
            let message: string;
            if (signalOrWarning === 'GAZE_OFF_SCREEN' || signalOrWarning === 'Looking away from screen') {
                message = MEDIAPIPE_STUDENT_MESSAGES.GAZE_OFF_SCREEN;
            } else if (signalOrWarning === 'MULTIPLE_FACES' || signalOrWarning === 'Multiple faces detected') {
                message = MEDIAPIPE_STUDENT_MESSAGES.MULTIPLE_FACES;
            } else if (signalOrWarning === 'NO_FACE_DETECTED' || signalOrWarning === 'Face not detected') {
                message = MEDIAPIPE_STUDENT_MESSAGES.NO_FACE_DETECTED;
            } else {
                message = 'Camera anomaly detected. Please remain focused on the exam.';
            }

            showNotice('video', message);
        },
        [showNotice],
    );

    useEffect(() => {
        return () => {
            clearDismissTimer();
        };
    }, [clearDismissTimer]);

    return {
        activeNotice,
        showNotice,
        showAudioAnomalyNotice,
        showMediaPipeNotice,
        dismissNotice,
    };
}
