import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { useApi } from '@sentinel/hooks';
import {
    analyzeMediaPipeFrame,
    createMediaPipeSignalTrackerState,
    evaluateMediaPipeSignalDispatch,
    resolveMediaPipeThresholds,
} from '@sentinel/shared';
import type { MediaPipeFrameAnalysis } from '@sentinel/shared';
import type { ExamConfig } from '@sentinel/shared/types';
import { useStudentExamMediaPipeStream } from '@/app/(protected)/student/exam/[id]/_components/student-exam-mediapipe-provider';
import {
    emitMediaPipeTelemetryEvent,
    isMediaPipeTelemetryEventEnabled,
} from '@/app/(protected)/student/exam/[id]/_lib/web-telemetry-client';
import { MEDIAPIPE_MODEL_PATH, MEDIAPIPE_WASM_PATH } from '../_constants';
import type { MediaPipeAttemptIncident, ResolvedMediaPipeSandbox } from '../_types';
import {
    attachMediaPipeStreamToVideo,
    mapNormalizedLandmarksToMediaPipeLandmarks,
    normalizeAttemptMediaPipeAnalysis,
} from '../_utils';
import type { MediapipeRuntimeEligibility } from './use-mediapipe-runtime-eligibility';

export type MediapipeSignalThresholds = ReturnType<typeof resolveMediaPipeThresholds>;

export type UseMediapipeCameraRuntimeArgs = {
    examId: string;
    examSessionId?: string;
    studentId?: string;
    configuration?: ExamConfig;
    activeSandbox: ResolvedMediaPipeSandbox | undefined;
    thresholds: MediapipeSignalThresholds;
    eligibility: MediapipeRuntimeEligibility;
    setActiveIncident: (incident: MediaPipeAttemptIncident | null) => void;
};

export type UseMediapipeCameraRuntimeResult = {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    analysis: MediaPipeFrameAnalysis | null;
    phase: 'idle' | 'starting' | 'running' | 'error';
    errorMessage: string | null;
};

/**
 * Owns the entire camera lifecycle for MediaPipe monitoring during an exam attempt:
 *
 * - Acquires the camera stream (shared or owned).
 * - Initialises the MediaPipe FaceLandmarker.
 * - Runs the per-frame analysis tick loop.
 * - Dispatches telemetry events and raises incidents when signal thresholds are exceeded.
 * - Tears everything down cleanly on unmount or when eligibility is lost.
 */
export function useMediapipeCameraRuntime({
    examId,
    examSessionId,
    studentId,
    configuration,
    activeSandbox,
    thresholds,
    eligibility,
    setActiveIncident,
}: UseMediapipeCameraRuntimeArgs): UseMediapipeCameraRuntimeResult {
    const apiClient = useApi();
    const { stream: sharedStream } = useStudentExamMediaPipeStream();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const ownsStreamRef = useRef(false);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameAtRef = useRef(0);
    const lastSessionIdRef = useRef<string | null>(null);
    const trackerRef = useRef(createMediaPipeSignalTrackerState());

    const [analysis, setAnalysis] = useState<MediaPipeFrameAnalysis | null>(null);
    const [phase, setPhase] = useState<'idle' | 'starting' | 'running' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { baseRuntimeEnabled, activationState } = eligibility;

    // ---------------------------------------------------------------------------
    // Cleanup — stops the animation loop, closes the FaceLandmarker, and releases
    // the camera stream if this hook acquired it.
    // ---------------------------------------------------------------------------
    const stopRuntime = useCallback(() => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (faceLandmarkerRef.current && typeof faceLandmarkerRef.current.close === 'function') {
            faceLandmarkerRef.current.close();
            faceLandmarkerRef.current = null;
        }

        if (streamRef.current && ownsStreamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        streamRef.current = null;
        ownsStreamRef.current = false;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setActiveIncident(null);
    }, [setActiveIncident]);

    // ---------------------------------------------------------------------------
    // Main effect — starts the runtime when eligibility is satisfied and tears it
    // down when the component unmounts or any dependency changes.
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (
            !baseRuntimeEnabled ||
            !activationState.isValid ||
            !configuration ||
            !activeSandbox ||
            !examSessionId ||
            !studentId
        ) {
            stopRuntime();
            setPhase('idle');
            setAnalysis(null);
            setErrorMessage(
                baseRuntimeEnabled && !activationState.isValid
                    ? activationState.status === 'stale'
                        ? 'MediaPipe checkup activation expired before the attempt began. Return to checkup to reactivate monitoring.'
                        : 'MediaPipe must be activated from checkup before it can continue into the live attempt.'
                    : null,
            );
            trackerRef.current = createMediaPipeSignalTrackerState();
            lastFrameAtRef.current = 0;
            return;
        }

        const sandbox = activeSandbox;
        const resolvedConfiguration = configuration;
        const sessionId = examSessionId;
        const resolvedStudentId = studentId;
        const calibrationProfile = activationState.storedFlow.mediaPipeCalibrationProfile;
        let disposed = false;

        async function start() {
            // Reset per-session tracking state when the session changes.
            if (examSessionId !== lastSessionIdRef.current) {
                trackerRef.current = createMediaPipeSignalTrackerState();
                lastFrameAtRef.current = 0;
                lastSessionIdRef.current = examSessionId ?? null;
            }

            setPhase('starting');
            setErrorMessage(null);

            try {
                const stream =
                    sharedStream ??
                    (await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false,
                    }));

                if (disposed) {
                    if (!sharedStream) {
                        stream.getTracks().forEach((track) => track.stop());
                    }
                    return;
                }

                streamRef.current = stream;
                ownsStreamRef.current = !sharedStream;

                attachMediaPipeStreamToVideo(videoRef.current, stream);

                const visionModule = await import('@mediapipe/tasks-vision');
                const resolver =
                    await visionModule.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);

                if (disposed) return;

                faceLandmarkerRef.current = await visionModule.FaceLandmarker.createFromOptions(
                    resolver,
                    {
                        baseOptions: { modelAssetPath: MEDIAPIPE_MODEL_PATH },
                        runningMode: 'VIDEO',
                        numFaces: 2,
                        minFaceDetectionConfidence: Math.max(
                            0.35,
                            sandbox.confidenceThreshold - 0.2,
                        ),
                        minFacePresenceConfidence: Math.max(
                            0.35,
                            sandbox.confidenceThreshold - 0.2,
                        ),
                        minTrackingConfidence: Math.max(0.35, sandbox.confidenceThreshold - 0.2),
                    },
                );

                setPhase('running');

                // -----------------------------------------------------------------
                // Per-frame tick — runs on every animation frame, throttled by
                // `sandbox.frameIntervalMs`.
                // -----------------------------------------------------------------
                const tick = () => {
                    const currentSandbox = activeSandbox;

                    if (
                        disposed ||
                        !videoRef.current ||
                        !faceLandmarkerRef.current ||
                        !currentSandbox
                    ) {
                        return;
                    }

                    const now = performance.now();

                    if (now - lastFrameAtRef.current < currentSandbox.frameIntervalMs) {
                        animationFrameRef.current = window.requestAnimationFrame(tick);
                        return;
                    }

                    lastFrameAtRef.current = now;

                    if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
                        animationFrameRef.current = window.requestAnimationFrame(tick);
                        return;
                    }

                    const detectionResult: FaceLandmarkerResult =
                        faceLandmarkerRef.current.detectForVideo(videoRef.current, now);

                    const landmarksByFace = mapNormalizedLandmarksToMediaPipeLandmarks(
                        detectionResult.faceLandmarks ?? [],
                    );

                    const frameAnalysis = analyzeMediaPipeFrame({
                        landmarksByFace,
                        confidenceThreshold: currentSandbox.confidenceThreshold,
                        calibrationProfile,
                    });

                    const normalizedAnalysis = normalizeAttemptMediaPipeAnalysis({
                        analysis: frameAnalysis,
                        configuration: resolvedConfiguration,
                    });

                    // Only dispatch telemetry for signals that are enabled for this exam.
                    const telemetrySignal =
                        normalizedAnalysis.signal &&
                        isMediaPipeTelemetryEventEnabled(
                            resolvedConfiguration,
                            normalizedAnalysis.signal,
                        )
                            ? normalizedAnalysis.signal
                            : null;

                    setAnalysis(normalizedAnalysis);

                    const dispatch = evaluateMediaPipeSignalDispatch({
                        currentSignal: telemetrySignal,
                        tracker: trackerRef.current,
                        nowMs: Date.now(),
                        thresholds,
                    });

                    trackerRef.current = dispatch.tracker;

                    if (dispatch.shouldEmit && telemetrySignal) {
                        // Show a contextual toast for each incident type.
                        if (telemetrySignal === 'GAZE_OFF_SCREEN') {
                            toast.warning('Please keep your eyes on the exam screen.', {
                                description:
                                    'Ensure your face is centered and you are looking at the content.',
                            });
                        } else if (telemetrySignal === 'NO_FACE_DETECTED') {
                            toast.warning('Face not detected.', {
                                description: 'Please make sure you are visible to the camera.',
                            });
                        } else if (telemetrySignal === 'MULTIPLE_FACES') {
                            toast.warning('Multiple faces detected.', {
                                description: 'Please ensure you are alone during the exam.',
                            });
                        }

                        setActiveIncident({
                            eventType: telemetrySignal,
                            detectedAt: new Date().toISOString(),
                            analysis: normalizedAnalysis,
                        });

                        void emitMediaPipeTelemetryEvent(apiClient, {
                            configuration: resolvedConfiguration,
                            mediaPipeSandbox: sandbox,
                            examSessionId: sessionId,
                            studentId: resolvedStudentId,
                            eventType: telemetrySignal,
                            metadata: {
                                durationMs: dispatch.durationMs,
                                confidenceScore: normalizedAnalysis.confidenceScore ?? undefined,
                                aggregation: dispatch.aggregation,
                            },
                        }).catch((error) => {
                            console.error('Failed to emit MediaPipe telemetry event.', { error });
                        });
                    }

                    animationFrameRef.current = window.requestAnimationFrame(tick);
                };

                animationFrameRef.current = window.requestAnimationFrame(tick);
            } catch (error) {
                console.error('Failed to start attempt MediaPipe monitoring.', error);
                stopRuntime();
                setPhase('error');
                setErrorMessage('MediaPipe monitoring could not start for this attempt.');
            }
        }

        void start();

        return () => {
            disposed = true;
            stopRuntime();
        };
    }, [
        apiClient,
        examSessionId,
        studentId,
        activationState.isValid,
        activationState.status,
        activationState.storedFlow.mediaPipeCalibrationProfile,
        baseRuntimeEnabled,
        configuration,
        examId,
        sharedStream,
        stopRuntime,
        activeSandbox,
        thresholds,
        setActiveIncident,
    ]);

    return { videoRef, analysis, phase, errorMessage };
}
