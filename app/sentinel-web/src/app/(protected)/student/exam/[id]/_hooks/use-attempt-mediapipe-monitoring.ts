'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import {
    analyzeMediaPipeFrame,
    createMediaPipeSignalTrackerState,
    evaluateMediaPipeSignalDispatch,
    isMediaPipeRuntimeEnabled,
    resolveMediaPipeThresholds,
    type MediaPipeFrameAnalysis,
    type TelemetrySettings,
} from '@sentinel/shared';
import type { ExamConfig, ExamRuntimeAccess } from '@sentinel/shared/types';
import { emitMediaPipeTelemetryEvent } from '../_lib/web-telemetry-client';

const MEDIAPIPE_WASM_PATH =
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const MEDIAPIPE_MODEL_PATH =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type UseAttemptMediaPipeMonitoringArgs = {
    configuration?: ExamConfig;
    mediaPipeSandbox?: TelemetrySettings['mediaPipeSandbox'];
    examSessionId?: string;
    runtimeAccess?: ExamRuntimeAccess | null;
};

export function useAttemptMediaPipeMonitoring({
    configuration,
    mediaPipeSandbox,
    examSessionId,
    runtimeAccess,
}: UseAttemptMediaPipeMonitoringArgs) {
    const apiClient = useApi();
    const { user } = useAuth();
    const studentId = user?.id;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const faceLandmarkerRef = useRef<any>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameAtRef = useRef(0);
    const trackerRef = useRef(createMediaPipeSignalTrackerState());
    const [analysis, setAnalysis] = useState<MediaPipeFrameAnalysis | null>(null);
    const [phase, setPhase] = useState<'idle' | 'starting' | 'running' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const runtimeAccessAllowed = Boolean(
        runtimeAccess?.canStart || runtimeAccess?.canResume || runtimeAccess?.hasActiveAttempt,
    );
    const activeSandbox = mediaPipeSandbox;
    const activeExamSessionId = examSessionId;
    const activeStudentId = studentId;
    const isEnabled = Boolean(
        activeExamSessionId &&
            activeStudentId &&
            configuration?.cameraRequired &&
            isMediaPipeRuntimeEnabled({
                sandbox: activeSandbox,
                configuration,
                stage: 'attempt',
                runtimeAccessAllowed,
            }),
    );
    const thresholds = useMemo(
        () =>
            resolveMediaPipeThresholds({
                sandbox:
                    activeSandbox ?? {
                        enabled: false,
                        captureDuringCheckup: false,
                        emitDuringExam: false,
                        confidenceThreshold: 0.8,
                        frameIntervalMs: 500,
                        offScreenDurationMs: 3000,
                        calibrationRequired: false,
                        debugOverlayEnabled: false,
                    },
            }),
        [activeSandbox],
    );

    useEffect(() => {
        if (!isEnabled || !configuration || !activeSandbox || !activeExamSessionId || !activeStudentId) {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            if (faceLandmarkerRef.current && typeof faceLandmarkerRef.current.close === 'function') {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            setPhase('idle');
            setAnalysis(null);
            setErrorMessage(null);
            trackerRef.current = createMediaPipeSignalTrackerState();
            return;
        }

        const sandbox = activeSandbox;
        const sessionId = activeExamSessionId;
        const resolvedStudentId = activeStudentId;
        let disposed = false;

        async function start() {
            setPhase('starting');
            setErrorMessage(null);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });

                if (disposed) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                const visionModule = await import('@mediapipe/tasks-vision');
                const resolver = await visionModule.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);

                if (disposed) {
                    return;
                }

                faceLandmarkerRef.current = await visionModule.FaceLandmarker.createFromOptions(
                    resolver,
                    {
                        baseOptions: {
                            modelAssetPath: MEDIAPIPE_MODEL_PATH,
                        },
                        runningMode: 'VIDEO',
                        numFaces: 2,
                        outputFaceBlendshapes: false,
                        outputFacialTransformationMatrixes: false,
                        minFaceDetectionConfidence: Math.max(
                            0.35,
                            sandbox.confidenceThreshold - 0.2,
                        ),
                        minFacePresenceConfidence: Math.max(
                            0.35,
                            sandbox.confidenceThreshold - 0.2,
                        ),
                        minTrackingConfidence: Math.max(
                            0.35,
                            sandbox.confidenceThreshold - 0.2,
                        ),
                    },
                );

                setPhase('running');

                const tick = () => {
                    if (disposed || !videoRef.current || !faceLandmarkerRef.current) {
                        return;
                    }

                    const now = performance.now();

                    if (now - lastFrameAtRef.current < sandbox.frameIntervalMs) {
                        animationFrameRef.current = window.requestAnimationFrame(tick);
                        return;
                    }

                    lastFrameAtRef.current = now;

                    if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
                        animationFrameRef.current = window.requestAnimationFrame(tick);
                        return;
                    }

                    const result = faceLandmarkerRef.current.detectForVideo(videoRef.current, now);
                    const landmarksByFace = (result.faceLandmarks ?? []).map((landmarks: any[]) =>
                        landmarks.map((landmark) => ({
                            x: landmark.x,
                            y: landmark.y,
                            z: landmark.z,
                        })),
                    );
                    const nextAnalysis = analyzeMediaPipeFrame({
                        landmarksByFace,
                        confidenceThreshold: sandbox.confidenceThreshold,
                    });

                    setAnalysis(nextAnalysis);

                    const dispatch = evaluateMediaPipeSignalDispatch({
                        currentSignal: nextAnalysis.signal,
                        tracker: trackerRef.current,
                        nowMs: Date.now(),
                        thresholds,
                    });

                    trackerRef.current = dispatch.tracker;

                    if (dispatch.shouldEmit && nextAnalysis.signal) {
                        void emitMediaPipeTelemetryEvent(apiClient, {
                            configuration,
                            mediaPipeSandbox: sandbox,
                            examSessionId: sessionId,
                            studentId: resolvedStudentId,
                            eventType: nextAnalysis.signal,
                            metadata: {
                                durationMs: dispatch.durationMs,
                                confidenceScore: nextAnalysis.confidenceScore ?? undefined,
                                aggregation: dispatch.aggregation,
                            },
                        }).catch((error) => {
                            console.error('Failed to emit MediaPipe telemetry event.', {
                                error,
                                eventType: nextAnalysis.signal,
                            });
                        });
                    }

                    animationFrameRef.current = window.requestAnimationFrame(tick);
                };

                animationFrameRef.current = window.requestAnimationFrame(tick);
            } catch (error) {
                console.error('Failed to start attempt MediaPipe monitoring.', error);
                setPhase('error');
                setErrorMessage(
                    'MediaPipe monitoring could not start for this attempt. Existing browser security monitoring remains active.',
                );
            }
        }

        void start();

        return () => {
            disposed = true;

            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            if (faceLandmarkerRef.current && typeof faceLandmarkerRef.current.close === 'function') {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [
        apiClient,
        activeExamSessionId,
        activeSandbox,
        activeStudentId,
        configuration,
        isEnabled,
        thresholds,
    ]);

    return {
        videoRef,
        analysis,
        phase,
        errorMessage,
        isEnabled,
    };
}
