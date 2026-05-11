'use client';

import { useEffect, useRef } from 'react';
import type { ExamConfiguration } from '@sentinel/shared/types';
import { useStudentExamMediaPipeStream } from '../_components/student-exam-mediapipe-provider';
import { useCheckupAudio } from '../_components/student-exam-audio-provider';

type UseStudentCheckupManagerArgs = {
    configuration: ExamConfiguration;
};

export function useStudentCheckupManager({ configuration }: UseStudentCheckupManagerArgs) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const {
        stream,
        cameraState,
        isRequesting: isRequestingCamera,
        isStreamActive,
        errorMessage: cameraErrorMessage,
        requestDeviceAccess: requestCameraAccess,
    } = useStudentExamMediaPipeStream();

    const { audioState, isRequestingAudio, audioErrorMessage, requestAudioAccess } =
        useCheckupAudio();

    useEffect(() => {
        const videoElement = videoRef.current;

        if (!videoElement) {
            return;
        }

        if (!stream) {
            videoElement.srcObject = null;
            return;
        }

        videoElement.srcObject = stream;
        void videoElement.play().catch(() => undefined);
    }, [stream]);

    const isCheckupReady =
        (!configuration.cameraRequired || cameraState === 'granted') &&
        (!configuration.micRequired || audioState === 'granted');

    const requestDeviceAccess = async (config: ExamConfiguration) => {
        // Request both in parallel so they don't block each other if one fails
        await Promise.allSettled([requestCameraAccess(config), requestAudioAccess(config)]);
    };

    return {
        videoRef,
        cameraState,
        micState: audioState,
        isRequesting: isRequestingCamera || isRequestingAudio,
        isStreamActive,
        errorMessage: cameraErrorMessage || audioErrorMessage,
        isCheckupReady,
        requestDeviceAccess: () => requestDeviceAccess(configuration),
    };
}
