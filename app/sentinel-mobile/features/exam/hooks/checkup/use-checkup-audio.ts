import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder, useAudioRecorderState, AudioModule, RecordingPresets } from 'expo-audio';

export const MIC_THRESHOLD = 0.15;
export const METERING_INTERVAL = 150;

export interface UseCheckupAudioOptions {
    requiresMicrophone?: boolean;
}

export interface UseCheckupAudioReturn {
    micLevel: number;
    micDetected: boolean;
    startMicMetering: () => Promise<void>;
    stopMicMetering: () => Promise<void>;
}

export function useCheckupAudio(options: UseCheckupAudioOptions = {}): UseCheckupAudioReturn {
    const { requiresMicrophone = true } = options;
    const [micLevel, setMicLevel] = useState(0);
    const [micDetected, setMicDetected] = useState(false);

    const audioRecorder = useAudioRecorder(
        {
            ...RecordingPresets.HIGH_QUALITY,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            isMeteringEnabled: true,
        },
        () => {
            // Optional: handle status changes if needed
        },
    );

    const recorderState = useAudioRecorderState(audioRecorder, METERING_INTERVAL);

    // Audio Processing: normalize dB (-60 to 0) to 0-1
    useEffect(() => {
        const db = recorderState.metering ?? -160;
        const normalized = Math.max(0, Math.min(1, (db + 60) / 60));

        setMicLevel(normalized);

        if (normalized > MIC_THRESHOLD) {
            setMicDetected(true);
        }
    }, [recorderState]);

    const startMicMetering = useCallback(async () => {
        if (!requiresMicrophone) {
            setMicDetected(true);
            return;
        }

        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                console.warn('Audio recording permission denied:', status);
                return;
            }

            // iOS requires setting the audio mode before recording
            await AudioModule.setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
                interruptionMode: 'doNotMix',
                shouldPlayInBackground: false,
            });

            if (!audioRecorder.isRecording) {
                try {
                    await audioRecorder.prepareToRecordAsync({
                        ...RecordingPresets.HIGH_QUALITY,
                        sampleRate: 44100,
                        numberOfChannels: 1,
                        bitRate: 128000,
                        isMeteringEnabled: true,
                    });
                    audioRecorder.record();
                } catch (e) {
                    console.error('Error starting audio recording:', e);
                }
            }
        } catch (error) {
            console.error('Failed to start recording sequence:', error);
        }
    }, [audioRecorder, requiresMicrophone]);

    const stopMicMetering = useCallback(async () => {
        try {
            if (audioRecorder.isRecording) {
                await audioRecorder.stop();
            }
        } catch (error) {
            console.log('Error stopping microphone:', error);
        }
    }, [audioRecorder]);

    // Lifecycle Management:
    // We intentionally do NOT call stopMicMetering in unmount cleanup because useAudioRecorder
    // automatically cleans up the native object on unmount. Calling .stop() causes NativeSharedObjectNotFoundException.
    useEffect(() => {
        void startMicMetering();
    }, [startMicMetering]);

    return {
        micLevel,
        micDetected,
        startMicMetering,
        stopMicMetering,
    };
}
