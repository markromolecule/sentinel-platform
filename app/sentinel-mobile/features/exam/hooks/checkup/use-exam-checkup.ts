import { useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useExamQuery } from '@sentinel/hooks';
import { type UseExamCheckupReturn } from '@/types/exam';
import { adaptExamForMobile } from '@/features/exam/lib/mobile-exam-adapter';
import { useCheckupCamera } from './use-checkup-camera';
import { useCheckupAudio } from './use-checkup-audio';
import { useCheckupCalibration } from './use-checkup-calibration';

export { useCheckupCamera } from './use-checkup-camera';
export { useCheckupAudio } from './use-checkup-audio';
export { useCheckupCalibration } from './use-checkup-calibration';

export function useExamCheckup(): UseExamCheckupReturn {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const examId = typeof id === 'string' ? id : undefined;

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const { data: rawExam } = useExamQuery(examId);
    const exam = rawExam ? adaptExamForMobile(rawExam) : undefined;
    const requiresCamera = exam?.configuration?.cameraRequired ?? true;
    const requiresMicrophone = exam?.configuration?.micRequired ?? true;

    // Sub-hook 1: Camera device state, permissions, and orientation
    const camera = useCheckupCamera({ requiresCamera });

    // Sub-hook 2: Microphone metering, dB normalization, and threshold detection
    const audio = useCheckupAudio({ requiresMicrophone });

    // Sub-hook 3: MediaPipe face centering, stability tracking, and profile calibration
    const calibration = useCheckupCalibration({
        id: examId,
        exam,
        cameraReady: camera.cameraReady,
        hasCameraPermission: camera.hasCameraPermission,
    });

    const [isStartingSession, setIsStartingSession] = useState(false);

    const handleGoBack = useCallback(async () => {
        await audio.stopMicMetering();
        router.back();
    }, [audio, router]);

    const handleStartExam = useCallback(async () => {
        if (!exam) return;

        const isMediaPipeConfigured = Boolean(
            exam.mediaPipeSandbox?.enabled &&
            exam.mediaPipeSandbox?.captureDuringCheckup,
        );

        if (isMediaPipeConfigured && !calibration.isCalibrated) {
            return;
        }

        setIsStartingSession(true);
        try {
            if (audio.micDetected && examId) {
                await AsyncStorage.setItem(`sentinel-mobile:audio-ready:${examId}`, 'true');
            }

            await audio.stopMicMetering();
            router.push(`/exam/${examId}/lobby`);
        } finally {
            setIsStartingSession(false);
        }
    }, [exam, calibration.isCalibrated, audio, examId, router]);

    return {
        exam,
        colors,
        isDark,
        insets,
        cameraFacing: camera.cameraFacing,
        cameraReady: camera.cameraReady,
        hasCameraPermission: camera.hasCameraPermission,
        isPermissionLoading: camera.isPermissionLoading,
        requestCameraPermission: camera.requestCameraPermission,
        micLevel: audio.micLevel,
        micDetected: audio.micDetected,
        requiresCamera,
        requiresMicrophone,
        isStartingSession,
        onCameraReady: camera.onCameraReady,
        onCameraMountError: camera.onCameraMountError,
        flipCamera: camera.flipCamera,
        handleGoBack,
        handleStartExam,
        calibrationProgress: calibration.calibrationProgress,
        isCalibrated: calibration.isCalibrated,
        calibrationFeedback: calibration.calibrationFeedback,
        calibrationProfile: calibration.calibrationProfile,
        isFaceCentered: calibration.isFaceCentered,
        handleLandmarksDetected: calibration.handleLandmarksDetected,
    };
}
