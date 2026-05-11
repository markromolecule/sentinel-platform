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

export type StudentExamPermissionState = 'idle' | 'granted' | 'blocked';

type StudentExamMediaPipeContextValue = {
    stream: MediaStream | null;
    isStreamActive: boolean;
    cameraState: StudentExamPermissionState;
    micState: StudentExamPermissionState;
    isRequesting: boolean;
    errorMessage: string | null;
    requestDeviceAccess: (configuration: ExamConfiguration) => Promise<void>;
    stopStream: () => void;
};

const DEFAULT_STUDENT_EXAM_MEDIAPIPE_CONTEXT: StudentExamMediaPipeContextValue = {
    stream: null,
    isStreamActive: false,
    cameraState: 'idle',
    micState: 'idle',
    isRequesting: false,
    errorMessage: null,
    requestDeviceAccess: async () => undefined,
    stopStream: () => undefined,
};

const StudentExamMediaPipeContext = createContext<StudentExamMediaPipeContextValue>(
    DEFAULT_STUDENT_EXAM_MEDIAPIPE_CONTEXT,
);

export function StudentExamMediaPipeProvider({ children }: { children: ReactNode }) {
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraState, setCameraState] = useState<StudentExamPermissionState>('idle');
    const [micState, setMicState] = useState<StudentExamPermissionState>('idle');
    const [isRequesting, setIsRequesting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const stopStream = useCallback(() => {
        if (!streamRef.current) {
            return;
        }

        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
    }, []);

    useEffect(() => {
        return () => {
            if (!streamRef.current) {
                return;
            }

            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!stream) {
            return;
        }

        const handleTrackEnded = () => {
            const activeStream = streamRef.current;

            if (!activeStream) {
                return;
            }

            const hasActiveVideoTrack = activeStream
                .getVideoTracks()
                .some((track) => track.readyState === 'live');

            setCameraState(hasActiveVideoTrack ? 'granted' : 'blocked');

            if (!hasActiveVideoTrack) {
                setStream(null);
                streamRef.current = null;
            }
        };

        const tracks = stream.getTracks();

        tracks.forEach((track) => track.addEventListener('ended', handleTrackEnded));

        return () => {
            tracks.forEach((track) => track.removeEventListener('ended', handleTrackEnded));
        };
    }, [stream]);

    const requestDeviceAccess = useCallback(
        async (configuration: ExamConfiguration) => {
            setIsRequesting(true);
            setErrorMessage(null);

            try {
                stopStream();

                const nextStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });

                streamRef.current = nextStream;
                setStream(nextStream);
                setCameraState(nextStream.getVideoTracks().length > 0 ? 'granted' : 'blocked');
            } catch {
                setCameraState(configuration.cameraRequired ? 'blocked' : 'idle');
                setErrorMessage(
                    'Camera access was blocked. Allow camera permission in your browser and try again.',
                );
            } finally {
                setIsRequesting(false);
            }
        },
        [stopStream],
    );

    const value = useMemo(
        () => ({
            stream,
            isStreamActive: Boolean(
                stream && stream.getTracks().some((track) => track.readyState === 'live'),
            ),
            cameraState,
            micState,
            isRequesting,
            errorMessage,
            requestDeviceAccess,
            stopStream,
        }),
        [
            cameraState,
            errorMessage,
            isRequesting,
            micState,
            requestDeviceAccess,
            stopStream,
            stream,
        ],
    );

    return (
        <StudentExamMediaPipeContext.Provider value={value}>
            {children}
        </StudentExamMediaPipeContext.Provider>
    );
}

export function useStudentExamMediaPipeStream() {
    return useContext(StudentExamMediaPipeContext);
}
