'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExamConfiguration } from '@sentinel/shared/types';

export type PermissionState = 'idle' | 'granted' | 'blocked';

interface UseCheckupManagerProps {
    configuration: ExamConfiguration;
}

export function useCheckupManager({ configuration }: UseCheckupManagerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraState, setCameraState] = useState<PermissionState>('idle');
    const [micState, setMicState] = useState<PermissionState>('idle');
    const [isRequesting, setIsRequesting] = useState(false);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const requestDeviceAccess = async () => {
        setIsRequesting(true);
        setErrorMessage(null);

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                setIsStreamActive(false);
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            streamRef.current = stream;
            setIsStreamActive(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setCameraState(stream.getVideoTracks().length > 0 ? 'granted' : 'blocked');
            setMicState(stream.getAudioTracks().length > 0 ? 'granted' : 'blocked');
        } catch {
            setCameraState(configuration.cameraRequired ? 'blocked' : 'idle');
            setMicState(configuration.micRequired ? 'blocked' : 'idle');
            setIsStreamActive(false);
            setErrorMessage(
                'Camera or microphone access was blocked. Allow both permissions in your browser and try again.',
            );
        } finally {
            setIsRequesting(false);
        }
    };

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
        requestDeviceAccess,
    };
}
