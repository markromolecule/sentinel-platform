import { useEffect, useRef, useState } from 'react';
import {
    analyzeMediaPipeFrame,
    type MediaPipeCalibrationProfile,
    type MediaPipeFrameAnalysis,
    type MediaPipeLandmark,
} from '@sentinel/shared';
import type { ExamConfiguration, TelemetryMediaPipeSandboxSettings } from '@sentinel/shared/types';
import type { ApiClientType } from '@sentinel/services';
import { readStoredMobileCalibrationProfile } from '@/features/exam/lib/mobile-exam-storage';
import { emitMobileTelemetryEvent } from '@/features/exam/lib/mobile-telemetry-client';
import {
    type MediaPipeIncidentSignal,
    type MediaPipeWarningStatus,
    resolveMediaPipeIncident,
    isSameMediaPipeAnalysis,
    calculateIncidentDuration,
    buildMediaPipeTelemetryMetadata,
    evaluateIncidentTrigger,
} from '@/features/exam/lib/mobile-mediapipe-incident';

export type { MediaPipeIncidentSignal, MediaPipeWarningStatus } from '@/features/exam/lib/mobile-mediapipe-incident';

/**
 * Arguments for useMobileMediaPipeMonitoring hook.
 */
export type UseMobileMediaPipeMonitoringArgs = {
    examId: string;
    apiClient?: ApiClientType;
    configuration?: ExamConfiguration;
    mediaPipeSandbox?: TelemetryMediaPipeSandboxSettings & {
        consecutiveFrameThreshold?: number;
        cooldownMs?: number;
    };
    examSessionId: string;
    studentId?: string;
    landmarksByFace: MediaPipeLandmark[][];
    onAnomalyDetected?: (
        eventType: MediaPipeIncidentSignal,
    ) => void | Promise<void>;
};

/**
 * Result returned by useMobileMediaPipeMonitoring hook.
 */
export type UseMobileMediaPipeMonitoringResult = {
    warningStatus: MediaPipeWarningStatus;
    isMonitoring: boolean;
    analysis: MediaPipeFrameAnalysis | null;
    calibrationProfile: MediaPipeCalibrationProfile | null;
};

/**
 * Custom React hook that runs real-time MediaPipe face, gaze, and multi-face monitoring
 * on face landmark frames during a mobile exam session. Emits telemetry events to the backend
 * and manages incident warning states.
 */
export function useMobileMediaPipeMonitoring({
    examId,
    apiClient,
    configuration,
    mediaPipeSandbox,
    examSessionId,
    studentId,
    landmarksByFace,
    onAnomalyDetected,
}: UseMobileMediaPipeMonitoringArgs): UseMobileMediaPipeMonitoringResult {
    const [calibrationProfile, setCalibrationProfile] =
        useState<MediaPipeCalibrationProfile | null>(null);
    const [warningStatus, setWarningStatus] =
        useState<MediaPipeWarningStatus>(null);
    const [analysis, setAnalysis] = useState<MediaPipeFrameAnalysis | null>(null);

    const onAnomalyDetectedRef = useRef(onAnomalyDetected);
    onAnomalyDetectedRef.current = onAnomalyDetected;

    const consecutiveFrames = useRef<Record<MediaPipeIncidentSignal, number>>({
        GAZE_OFF_SCREEN: 0,
        MULTIPLE_FACES: 0,
        NO_FACE_DETECTED: 0,
    });

    const lastTriggeredAt = useRef<Record<MediaPipeIncidentSignal, number>>({
        GAZE_OFF_SCREEN: 0,
        MULTIPLE_FACES: 0,
        NO_FACE_DETECTED: 0,
    });

    const isMonitoring = Boolean(
        mediaPipeSandbox?.enabled &&
        mediaPipeSandbox?.emitDuringExam,
    );

    // 1. Load calibration profile on mount
    useEffect(() => {
        if (!examId) return;
        void readStoredMobileCalibrationProfile(examId).then((profile) => {
            if (profile) {
                setCalibrationProfile((prev) => (prev === profile ? prev : profile));
            }
        });
    }, [examId]);

    // 2. Continuous frame analyzer loop
    useEffect(() => {
        if (!isMonitoring) {
            setWarningStatus(null);
            setAnalysis(null);
            return;
        }

        const sandbox = mediaPipeSandbox;
        const confidenceThreshold = sandbox?.confidenceThreshold ?? 0.6;
        const consecutiveThreshold = sandbox?.consecutiveFrameThreshold ?? 2;
        const cooldownMs = sandbox?.cooldownMs ?? 10000;

        const currentAnalysis = analyzeMediaPipeFrame({
            landmarksByFace,
            confidenceThreshold,
            tolerateDownwardGaze: true,
            calibrationProfile,
        });

        setAnalysis((prev) => (isSameMediaPipeAnalysis(prev, currentAnalysis) ? prev : currentAnalysis));

        // Reset counts if frame is stable / ready
        if (currentAnalysis.status === 'ready') {
            consecutiveFrames.current.GAZE_OFF_SCREEN = 0;
            consecutiveFrames.current.MULTIPLE_FACES = 0;
            consecutiveFrames.current.NO_FACE_DETECTED = 0;
            setWarningStatus(null);
            return;
        }

        const { activeSignal, activeWarning } = resolveMediaPipeIncident(currentAnalysis.status);

        if (activeSignal) {
            // Reset counters for other signals
            const signals: MediaPipeIncidentSignal[] = ['GAZE_OFF_SCREEN', 'MULTIPLE_FACES', 'NO_FACE_DETECTED'];
            for (const key of signals) {
                if (key !== activeSignal) {
                    consecutiveFrames.current[key] = 0;
                }
            }

            consecutiveFrames.current[activeSignal] += 1;

            const now = Date.now();
            const { shouldTrigger } = evaluateIncidentTrigger({
                currentConsecutiveFrames: consecutiveFrames.current[activeSignal],
                consecutiveThreshold,
                lastTriggeredAt: lastTriggeredAt.current[activeSignal] ?? 0,
                now,
                cooldownMs,
            });

            if (shouldTrigger) {
                setWarningStatus(activeWarning);
                lastTriggeredAt.current[activeSignal] = now;
                const framesCount = consecutiveFrames.current[activeSignal];
                const frameIntervalMs = sandbox?.frameIntervalMs ?? 1000;
                const durationMs = calculateIncidentDuration(framesCount, frameIntervalMs);
                consecutiveFrames.current[activeSignal] = 0; // reset counter after trigger

                if (apiClient) {
                    const metadata = buildMediaPipeTelemetryMetadata({
                        signal: activeSignal,
                        confidenceScore: currentAnalysis.confidenceScore,
                        durationMs,
                    });

                    void emitMobileTelemetryEvent({
                        apiClient,
                        configuration,
                        examSessionId,
                        studentId,
                        eventType: activeSignal,
                        metadata,
                    }).catch((err) => {
                        console.error(
                            `Failed to emit mobile telemetry incident event ${activeSignal}`,
                            err,
                        );
                    });
                }

                if (onAnomalyDetectedRef.current) {
                    void onAnomalyDetectedRef.current(activeSignal);
                }
            }
        }
    }, [
        landmarksByFace,
        isMonitoring,
        calibrationProfile,
        configuration,
        mediaPipeSandbox,
        apiClient,
        examSessionId,
        studentId,
    ]);

    return {
        warningStatus,
        isMonitoring,
        analysis,
        calibrationProfile,
    };
}
