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
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
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
    /**
     * Returns the current MediaPipe-owned live video track without transferring
     * ownership. Callers may clone it, but only this provider may stop it.
     */
    getLiveVideoTrack: () => MediaStreamTrack | null;
    // MediaPipe Initialization Management
    faceLandmarker: FaceLandmarker | null;
    isMediaPipeInitializing: boolean;
    warmupMediaPipe: () => Promise<void>;
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
    getLiveVideoTrack: () => null,
    faceLandmarker: null,
    isMediaPipeInitializing: false,
    warmupMediaPipe: async () => undefined,
};

const StudentExamMediaPipeContext = createContext<StudentExamMediaPipeContextValue>(
    DEFAULT_STUDENT_EXAM_MEDIAPIPE_CONTEXT,
);

export function StudentExamMediaPipeProvider({ children }: { children: ReactNode }) {
    const streamRef = useRef<MediaStream | null>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraState, setCameraState] = useState<StudentExamPermissionState>('idle');
    const [micState, setMicState] = useState<StudentExamPermissionState>('idle');
    const [isRequesting, setIsRequesting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
    const [isMediaPipeInitializing, setIsMediaPipeInitializing] = useState(false);

    const stopStream = useCallback(() => {
        if (!streamRef.current) {
            return;
        }

        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
    }, []);

    const warmupMediaPipe = useCallback(async () => {
        if (landmarkerRef.current || isMediaPipeInitializing) return;

        setIsMediaPipeInitializing(true);
        try {
            const visionModule = await import('@mediapipe/tasks-vision');
            const resolver = await visionModule.FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm',
            );
            const landmarker = await visionModule.FaceLandmarker.createFromOptions(resolver, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                },
                runningMode: 'VIDEO',
                numFaces: 2,
            });
            landmarkerRef.current = landmarker;
            setFaceLandmarker(landmarker);
        } catch (error) {
            console.error('Failed to warmup MediaPipe:', error);
        } finally {
            setIsMediaPipeInitializing(false);
        }
    }, [isMediaPipeInitializing]);

    const getLiveVideoTrack = useCallback(() => {
        return (
            streamRef.current?.getVideoTracks().find((track) => track.readyState === 'live') ?? null
        );
    }, []);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
                landmarkerRef.current = null;
            }
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
            getLiveVideoTrack,
            faceLandmarker,
            isMediaPipeInitializing,
            warmupMediaPipe,
        }),
        [
            cameraState,
            errorMessage,
            getLiveVideoTrack,
            isRequesting,
            micState,
            requestDeviceAccess,
            stopStream,
            stream,
            faceLandmarker,
            isMediaPipeInitializing,
            warmupMediaPipe,
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
