'use client';

import { useEffect, useRef } from 'react';
import type { ExamConfiguration } from '@sentinel/shared/types';
import { useStudentExamMediaPipeStream } from '../_components/student-exam-mediapipe-provider';

type UseStudentCheckupManagerArgs = {
    configuration: ExamConfiguration;
};

export function useStudentCheckupManager({ configuration }: UseStudentCheckupManagerArgs) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const {
        stream,
        cameraState,
        micState,
        isRequesting,
        isStreamActive,
        errorMessage,
        requestDeviceAccess,
    } = useStudentExamMediaPipeStream();

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
        (!configuration.micRequired || micState === 'granted');

    return {
        videoRef,
        cameraState,
        micState,
        isRequesting,
        isStreamActive,
        errorMessage,
        isCheckupReady,
        requestDeviceAccess: () => requestDeviceAccess(configuration),
    };
}
