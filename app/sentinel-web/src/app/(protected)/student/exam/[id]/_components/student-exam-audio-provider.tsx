'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { ExamConfiguration } from '@sentinel/shared/types';
import type { StudentExamPermissionState } from './student-exam-mediapipe-provider';

type StudentExamAudioContextValue = {
    audioStream: MediaStream | null;
    isAudioStreamActive: boolean;
    audioState: StudentExamPermissionState;
    isRequestingAudio: boolean;
    audioErrorMessage: string | null;
    requestAudioAccess: (configuration: ExamConfiguration) => Promise<void>;
    stopAudioStream: () => void;
    // Audio Anomaly Worker Management
    worker: Worker | null;
    warmupAudioAnomaly: () => void;
};

const DEFAULT_CONTEXT: StudentExamAudioContextValue = {
    audioStream: null,
    isAudioStreamActive: false,
    audioState: 'idle',
    isRequestingAudio: false,
    audioErrorMessage: null,
    requestAudioAccess: async () => undefined,
    stopAudioStream: () => undefined,
    worker: null,
    warmupAudioAnomaly: () => undefined,
};

const StudentExamAudioContext = createContext<StudentExamAudioContextValue>(DEFAULT_CONTEXT);

export function StudentExamAudioProvider({ children }: { children: ReactNode }) {
    const streamRef = useRef<MediaStream | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [audioState, setAudioState] = useState<StudentExamPermissionState>('idle');
    const [isRequestingAudio, setIsRequestingAudio] = useState(false);
    const [audioErrorMessage, setAudioErrorMessage] = useState<string | null>(null);
    const [worker, setWorker] = useState<Worker | null>(null);

    const stopAudioStream = useCallback(() => {
        if (!streamRef.current) return;
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setAudioStream(null);
    }, []);

    const warmupAudioAnomaly = useCallback(() => {
        if (workerRef.current) return;

        const nextWorker = new Worker(
            new URL('../../../../../../workers/audio-anomaly.worker.ts', import.meta.url),
            { type: 'module' },
        );
        workerRef.current = nextWorker;
        setWorker(nextWorker);
    }, []);

    useEffect(() => {
        return () => {
            stopAudioStream();
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [stopAudioStream]);

    useEffect(() => {
        if (!audioStream) return;

        const handleTrackEnded = () => {
            if (!streamRef.current) return;
            const hasActive = streamRef.current.getAudioTracks().some((t) => t.readyState === 'live');
            setAudioState(hasActive ? 'granted' : 'blocked');
            if (!hasActive) {
                setAudioStream(null);
                streamRef.current = null;
            }
        };

        const tracks = audioStream.getTracks();
        tracks.forEach((track) => track.addEventListener('ended', handleTrackEnded));
        return () => {
            tracks.forEach((track) => track.removeEventListener('ended', handleTrackEnded));
        };
    }, [audioStream]);

    const requestAudioAccess = useCallback(
        async (configuration: ExamConfiguration) => {
            setIsRequestingAudio(true);
            setAudioErrorMessage(null);

            try {
                stopAudioStream();
                const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = nextStream;
                setAudioStream(nextStream);
                setAudioState(nextStream.getAudioTracks().length > 0 ? 'granted' : 'blocked');
            } catch (err: unknown) {
                setAudioState(configuration.micRequired ? 'blocked' : 'idle');
                const error = err as Error;
                if (error.name === 'NotAllowedError') {
                    setAudioErrorMessage(
                        'Microphone access was denied. Please allow it in your browser settings.',
                    );
                } else if (error.name === 'NotFoundError') {
                    setAudioErrorMessage('No microphone found on this device.');
                } else if (error.name === 'NotReadableError') {
                    setAudioErrorMessage('Microphone is already in use by another application.');
                } else {
                    setAudioErrorMessage('Failed to access microphone.');
                }
            } finally {
                setIsRequestingAudio(false);
            }
        },
        [stopAudioStream],
    );

    const value = useMemo(
        () => ({
            audioStream,
            isAudioStreamActive: Boolean(
                audioStream && audioStream.getTracks().some((t) => t.readyState === 'live'),
            ),
            audioState,
            isRequestingAudio,
            audioErrorMessage,
            requestAudioAccess,
            stopAudioStream,
            worker,
            warmupAudioAnomaly,
        }),
        [
            audioStream,
            audioState,
            isRequestingAudio,
            audioErrorMessage,
            requestAudioAccess,
            stopAudioStream,
            worker,
            warmupAudioAnomaly,
        ],
    );

    return (
        <StudentExamAudioContext.Provider value={value}>{children}</StudentExamAudioContext.Provider>
    );
}

export function useCheckupAudio() {
    return useContext(StudentExamAudioContext);
}
