import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readStoredMobileCalibrationProfile } from '@/features/exam/lib/mobile-exam-storage';

export interface UseLobbyReadinessOptions {
    id?: string;
    isMediaPipeConfigured: boolean;
    requiresMicrophone: boolean;
}

export interface UseLobbyReadinessReturn {
    isMediaPipeCalibrated: boolean;
    isAudioReady: boolean;
}

/**
 * Tracks and polls MediaPipe calibration and microphone readiness from local device storage.
 */
export function useLobbyReadiness({
    id,
    isMediaPipeConfigured,
    requiresMicrophone,
}: UseLobbyReadinessOptions): UseLobbyReadinessReturn {
    const [isMediaPipeCalibrated, setIsMediaPipeCalibrated] = useState(false);
    const [isAudioReady, setIsAudioReady] = useState(false);

    // Track calibration and audio readiness — evaluates immediately and only intervals if incomplete
    useEffect(() => {
        if (!id) return;
        if (isMediaPipeCalibrated && isAudioReady) return;

        let isMounted = true;
        let interval: ReturnType<typeof setInterval> | null = null;

        const checkReadiness = async (): Promise<boolean> => {
            try {
                const [profile, audioReadyStr] = await Promise.all([
                    readStoredMobileCalibrationProfile(id),
                    AsyncStorage.getItem(`sentinel-mobile:audio-ready:${id}`),
                ]);
                if (!isMounted) return false;

                const audioReady = audioReadyStr === 'true';
                const mediaPipeReady = !isMediaPipeConfigured || Boolean(profile);
                const micReady = !requiresMicrophone || audioReady;

                setIsMediaPipeCalibrated(mediaPipeReady);
                setIsAudioReady(micReady);

                return mediaPipeReady && micReady;
            } catch {
                return false;
            }
        };

        void checkReadiness().then((isReady) => {
            if (!isReady && isMounted) {
                interval = setInterval(async () => {
                    const ready = await checkReadiness();
                    if (ready && interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                }, 1000);
            }
        });

        return () => {
            isMounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [id, isMediaPipeConfigured, requiresMicrophone, isMediaPipeCalibrated, isAudioReady]);

    return {
        isMediaPipeCalibrated,
        isAudioReady,
    };
}
