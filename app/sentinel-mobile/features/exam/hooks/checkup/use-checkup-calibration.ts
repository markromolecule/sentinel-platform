import { useState, useEffect, useCallback } from 'react';
import { createMediaPipeCalibrationSample } from '@sentinel/shared';
import { type MobileExamDisplay } from '@/features/exam/lib/mobile-exam-adapter';
import {
    readStoredMobileCalibrationProfile,
    writeStoredMobileCalibrationProfile,
} from '@/features/exam/lib/mobile-exam-storage';
import {
    buildMobileCalibrationProfile,
    evaluateMobileCheckupFrame,
    isMobileCalibrationStable,
} from '@/features/exam/lib/mobile-mediapipe-calibration';

export const REQUIRED_CALIBRATION_FRAMES = 6;

export interface UseCheckupCalibrationOptions {
    id?: string;
    exam?: MobileExamDisplay;
    cameraReady: boolean;
    hasCameraPermission: boolean;
    cameraError?: string | null;
}

export interface UseCheckupCalibrationReturn {
    calibrationProgress: number;
    isCalibrated: boolean;
    calibrationFeedback: string | null;
    calibrationProfile: any | null;
    isFaceCentered: boolean;
    handleLandmarksDetected: (landmarks: any[][], confidenceScore: number) => void;
}

export function useCheckupCalibration({
    id,
    exam,
    cameraReady,
    hasCameraPermission,
    cameraError,
}: UseCheckupCalibrationOptions): UseCheckupCalibrationReturn {
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [calibrationFeedback, setCalibrationFeedback] = useState<string | null>(null);
    const [calibrationProfile, setCalibrationProfile] = useState<any | null>(null);
    const [isFaceCentered, setIsFaceCentered] = useState(false);
    const [calibrationSamples, setCalibrationSamples] = useState<any[]>([]);

    // Surface camera or bridge error if present
    useEffect(() => {
        if (cameraError) {
            setCalibrationFeedback(cameraError);
        }
    }, [cameraError]);

    // Load stored calibration profile on mount
    useEffect(() => {
        if (!id) return;
        void readStoredMobileCalibrationProfile(id).then((profile) => {
            if (profile) {
                setCalibrationProfile(profile);
                setIsCalibrated(true);
                setCalibrationProgress(100);
            }
        });
    }, [id]);

    // Auto-calibrate if MediaPipe is not configured for this exam
    useEffect(() => {
        if (!cameraReady || !hasCameraPermission || isCalibrated) {
            return;
        }

        const isMediaPipeConfigured = Boolean(
            exam?.mediaPipeSandbox?.enabled &&
            exam?.mediaPipeSandbox?.captureDuringCheckup,
        );

        if (!isMediaPipeConfigured) {
            setIsCalibrated(true);
            setCalibrationProgress(100);
        }
    }, [cameraReady, hasCameraPermission, isCalibrated, exam]);

    // Handle landmarks detected by the camera/WebView bridge
    const handleLandmarksDetected = useCallback((landmarks: any[][], confidenceScore: number) => {
        if (isCalibrated) return;

        const isMediaPipeConfigured = Boolean(
            exam?.mediaPipeSandbox?.enabled &&
            exam?.mediaPipeSandbox?.captureDuringCheckup,
        );

        if (!isMediaPipeConfigured) {
            setIsCalibrated(true);
            setCalibrationProgress(100);
            return;
        }

        const activeConfidenceThreshold = Math.max(
            0.35,
            (exam?.mediaPipeSandbox?.confidenceThreshold ?? 0.6) - 0.15,
        );

        // Run evaluation wrapping evaluateMobileCheckupFrame
        const { evaluation } = evaluateMobileCheckupFrame({
            landmarksByFace: landmarks,
            confidenceThreshold: activeConfidenceThreshold,
            calibrationProfile: null,
        });

        setIsFaceCentered(evaluation.isValid);
        setCalibrationFeedback(
            evaluation.isValid
                ? 'Hold still to calibrate...'
                : (evaluation.details ?? 'Align face in guide')
        );

        if (evaluation.isValid && landmarks[0]) {
            const sample = createMediaPipeCalibrationSample({
                landmarks: landmarks[0],
                confidenceScore: confidenceScore,
            });

            if (sample) {
                const prev = calibrationSamples;
                const lastSample = prev[prev.length - 1] ?? null;
                const stable = isMobileCalibrationStable(lastSample, sample);
                const nextSamples = stable ? [...prev, sample] : prev.slice(0, Math.max(0, prev.length - 2));

                const progress = Math.min(100, Math.round((nextSamples.length / REQUIRED_CALIBRATION_FRAMES) * 100));
                setCalibrationSamples(nextSamples);
                setCalibrationProgress(progress);

                if (nextSamples.length >= REQUIRED_CALIBRATION_FRAMES) {
                    const profile = buildMobileCalibrationProfile({ samples: nextSamples });
                    if (profile && id) {
                        setCalibrationProfile(profile);
                        setIsCalibrated(true);
                        setCalibrationFeedback(null);
                        void writeStoredMobileCalibrationProfile(id, profile);
                    }
                }
            }
        } else {
            // Decelerate or reset progress on invalid frames
            const nextSamples = calibrationSamples.slice(0, Math.max(0, calibrationSamples.length - 2));
            const progress = Math.min(100, Math.round((nextSamples.length / REQUIRED_CALIBRATION_FRAMES) * 100));
            setCalibrationSamples(nextSamples);
            setCalibrationProgress(progress);
        }
    }, [isCalibrated, exam, id, calibrationSamples]);

    return {
        calibrationProgress,
        isCalibrated,
        calibrationFeedback,
        calibrationProfile,
        isFaceCentered,
        handleLandmarksDetected,
    };
}
