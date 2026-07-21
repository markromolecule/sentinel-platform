'use client';

import { useEffect, useRef } from 'react';
import type { ExamConfiguration } from '@sentinel/shared/types';
import {
    isLiveVideoStream,
    useStudentExamMediaPipeStream,
} from '../_components/student-exam-mediapipe-provider';
import { isLiveAudioStream, useCheckupAudio } from '../_components/student-exam-audio-provider';

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
        mediaPipeError,
        requestDeviceAccess: requestCameraAccess,
        isCameraReady,
        isMediaPipeReady,
    } = useStudentExamMediaPipeStream();

    const {
        audioStream,
        audioState,
        isRequestingAudio,
        audioErrorMessage,
        requestAudioAccess,
        isAudioReady,
    } = useCheckupAudio();

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

    const isCameraLive = isLiveVideoStream(stream);
    const isAudioLive = isLiveAudioStream(audioStream);

    const isCheckupReady =
        (!configuration.cameraRequired || (cameraState === 'granted' && isCameraLive)) &&
        (!configuration.micRequired || (audioState === 'granted' && isAudioLive)) &&
        isMediaPipeReady(configuration) &&
        isAudioReady(configuration);

    const requestDeviceAccess = async (config: ExamConfiguration) => {
        // Request both in parallel so they don't block each other if one fails
        await Promise.allSettled([requestCameraAccess(config), requestAudioAccess(config)]);
    };

    return {
        videoRef,
        cameraState,
        micState: audioState,
        isRequesting: isRequestingCamera || isRequestingAudio,
        isStreamActive: isStreamActive || isLiveAudioStream(audioStream),
        cameraErrorMessage,
        audioErrorMessage,
        mediaPipeError,
        errorMessage: cameraErrorMessage || audioErrorMessage || mediaPipeError,
        isCheckupReady,
        requestDeviceAccess: () => requestDeviceAccess(configuration),
    };
}
