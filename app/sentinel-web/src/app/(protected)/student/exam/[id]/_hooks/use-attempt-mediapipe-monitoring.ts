'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import type {
    FaceLandmarker,
    FaceLandmarkerResult,
    NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import { toast } from 'sonner';
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
import {
    emitMediaPipeTelemetryEvent,
    isMediaPipeTelemetryEventEnabled,
} from '../_lib/web-telemetry-client';
import { resolveStoredStudentExamMediaPipeActivation } from '../_lib/student-exam-flow';
import { useStudentExamMediaPipeStream } from '../_components/student-exam-mediapipe-provider';

const MEDIAPIPE_WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const MEDIAPIPE_MODEL_PATH =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type UseAttemptMediaPipeMonitoringArgs = {
    examId: string;
    configuration?: ExamConfig;
    mediaPipeSandbox?: TelemetrySettings['mediaPipeSandbox'];
    examSessionId?: string;
    runtimeAccess?: ExamRuntimeAccess | null;
};

export type MediaPipeAttemptIncident = {
    eventType: 'GAZE_OFF_SCREEN' | 'NO_FACE_DETECTED' | 'MULTIPLE_FACES';
    detectedAt: string;
    analysis: MediaPipeFrameAnalysis;
};

function mapNormalizedLandmarksToMediaPipeLandmarks(landmarksByFace: NormalizedLandmark[][]) {
    return landmarksByFace.map((landmarks) =>
        landmarks.map((landmark) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
        })),
    );
}

function attachMediaPipeStreamToVideo(videoElement: HTMLVideoElement | null, stream: MediaStream) {
    if (!videoElement) {
        return;
    }

    videoElement.srcObject = stream;

    const playPromise = videoElement.play();

    if (typeof playPromise?.catch === 'function') {
        void playPromise.catch(() => undefined);
    }
}

function normalizeAttemptMediaPipeAnalysis(args: {
    analysis: MediaPipeFrameAnalysis;
    configuration: ExamConfig;
}): MediaPipeFrameAnalysis {
    const { analysis, configuration } = args;

    if (analysis.status !== 'low-confidence' || !configuration.aiRules.face_detection) {
        return analysis;
    }

    return {
        ...analysis,
        status: 'no-face',
        signal: 'NO_FACE_DETECTED',
        reasons: [
            'Face tracking confidence dropped below the required threshold during the attempt.',
            ...analysis.reasons,
        ],
    };
}

export function useAttemptMediaPipeMonitoring({
    examId,
    configuration,
    mediaPipeSandbox,
    examSessionId,
    runtimeAccess,
}: UseAttemptMediaPipeMonitoringArgs) {
    const apiClient = useApi();
    const { user } = useAuth();
    const studentId = user?.id;
    const { stream: sharedStream } = useStudentExamMediaPipeStream();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const ownsStreamRef = useRef(false);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameAtRef = useRef(0);
    const trackerRef = useRef(createMediaPipeSignalTrackerState());
    const [analysis, setAnalysis] = useState<MediaPipeFrameAnalysis | null>(null);
    const [phase, setPhase] = useState<'idle' | 'starting' | 'running' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeIncident, setActiveIncident] = useState<MediaPipeAttemptIncident | null>(null);

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
    }, []);

    const runtimeAccessAllowed = Boolean(
        runtimeAccess?.canStart || runtimeAccess?.canResume || runtimeAccess?.hasActiveAttempt,
    );
    const mediaPipeSandboxEnabled = mediaPipeSandbox?.enabled;
    const mediaPipeSandboxCaptureDuringCheckup = mediaPipeSandbox?.captureDuringCheckup;
    const mediaPipeSandboxEmitDuringExam = mediaPipeSandbox?.emitDuringExam;
    const mediaPipeSandboxConfidenceThreshold = mediaPipeSandbox?.confidenceThreshold;
    const mediaPipeSandboxFrameIntervalMs = mediaPipeSandbox?.frameIntervalMs;
    const mediaPipeSandboxOffScreenDurationMs = mediaPipeSandbox?.offScreenDurationMs;
    const mediaPipeSandboxCalibrationRequired = mediaPipeSandbox?.calibrationRequired;
    const mediaPipeSandboxDebugOverlayEnabled = mediaPipeSandbox?.debugOverlayEnabled;
    const activeSandbox = useMemo(() => {
        if (
            mediaPipeSandboxEnabled === undefined ||
            mediaPipeSandboxCaptureDuringCheckup === undefined ||
            mediaPipeSandboxEmitDuringExam === undefined ||
            mediaPipeSandboxConfidenceThreshold === undefined ||
            mediaPipeSandboxFrameIntervalMs === undefined ||
            mediaPipeSandboxOffScreenDurationMs === undefined ||
            mediaPipeSandboxCalibrationRequired === undefined ||
            mediaPipeSandboxDebugOverlayEnabled === undefined
        ) {
            return undefined;
        }

        return {
            enabled: mediaPipeSandboxEnabled,
            captureDuringCheckup: mediaPipeSandboxCaptureDuringCheckup,
            emitDuringExam: mediaPipeSandboxEmitDuringExam,
            confidenceThreshold: mediaPipeSandboxConfidenceThreshold,
            frameIntervalMs: mediaPipeSandboxFrameIntervalMs,
            offScreenDurationMs: mediaPipeSandboxOffScreenDurationMs,
            calibrationRequired: mediaPipeSandboxCalibrationRequired,
            debugOverlayEnabled: mediaPipeSandboxDebugOverlayEnabled,
        };
    }, [
        mediaPipeSandboxCalibrationRequired,
        mediaPipeSandboxCaptureDuringCheckup,
        mediaPipeSandboxConfidenceThreshold,
        mediaPipeSandboxDebugOverlayEnabled,
        mediaPipeSandboxEmitDuringExam,
        mediaPipeSandboxEnabled,
        mediaPipeSandboxFrameIntervalMs,
        mediaPipeSandboxOffScreenDurationMs,
    ]);
    const activeExamSessionId = examSessionId;
    const activeStudentId = studentId;
    const baseRuntimeEnabled = Boolean(
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
    const activationState = useMemo(
        () =>
            resolveStoredStudentExamMediaPipeActivation({
                examId,
                required: baseRuntimeEnabled,
            }),
        [baseRuntimeEnabled, examId],
    );
    const isEnabled = baseRuntimeEnabled && activationState.isValid;
    const thresholds = useMemo(() => {
        const resolved = resolveMediaPipeThresholds({
            sandbox: activeSandbox ?? {
                enabled: false,
                captureDuringCheckup: false,
                emitDuringExam: false,
                confidenceThreshold: 0.8,
                frameIntervalMs: 500,
                offScreenDurationMs: 1500, // Reduced for responsiveness
                calibrationRequired: false,
                debugOverlayEnabled: false,
            },
        });

        // Ensure responsive feedback for the attempt page specifically
        resolved.GAZE_OFF_SCREEN.durationThresholdMs = Math.min(
            resolved.GAZE_OFF_SCREEN.durationThresholdMs ?? 1500,
            1500,
        );
        resolved.NO_FACE_DETECTED.durationThresholdMs = Math.min(
            resolved.NO_FACE_DETECTED.durationThresholdMs ?? 1500,
            1500,
        );

        return resolved;
    }, [activeSandbox]);

    useEffect(() => {
        if (
            !baseRuntimeEnabled ||
            !activationState.isValid ||
            !configuration ||
            !activeSandbox ||
            !activeExamSessionId ||
            !activeStudentId
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
            setActiveIncident(null);
            trackerRef.current = createMediaPipeSignalTrackerState();
            lastFrameAtRef.current = 0;
            return;
        }

        const sandbox = activeSandbox;
        const resolvedConfiguration = configuration;
        const sessionId = activeExamSessionId;
        const resolvedStudentId = activeStudentId;
        const calibrationProfile = activationState.isValid
            ? activationState.storedFlow.mediaPipeCalibrationProfile
            : null;
        let disposed = false;

        async function start() {
            trackerRef.current = createMediaPipeSignalTrackerState();
            lastFrameAtRef.current = 0;
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
                        minTrackingConfidence: Math.max(0.35, sandbox.confidenceThreshold - 0.2),
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

                    const result: FaceLandmarkerResult = faceLandmarkerRef.current.detectForVideo(
                        videoRef.current,
                        now,
                    );
                    const landmarksByFace = mapNormalizedLandmarksToMediaPipeLandmarks(
                        result.faceLandmarks ?? [],
                    );
                    const nextAnalysis = analyzeMediaPipeFrame({
                        landmarksByFace,
                        confidenceThreshold: sandbox.confidenceThreshold,
                        calibrationProfile,
                    });
                    const normalizedAnalysis = normalizeAttemptMediaPipeAnalysis({
                        analysis: nextAnalysis,
                        configuration: resolvedConfiguration,
                    });
                    const dispatchSignal =
                        normalizedAnalysis.signal &&
                        isMediaPipeTelemetryEventEnabled(
                            resolvedConfiguration,
                            normalizedAnalysis.signal,
                        )
                            ? normalizedAnalysis.signal
                            : null;

                    setAnalysis(normalizedAnalysis);

                    const dispatch = evaluateMediaPipeSignalDispatch({
                        currentSignal: dispatchSignal,
                        tracker: trackerRef.current,
                        nowMs: Date.now(),
                        thresholds,
                    });

                    trackerRef.current = dispatch.tracker;

                    if (dispatch.shouldEmit && dispatchSignal) {
                        // Notify the student via toast, similar to clipboard/tab-switching warnings
                        if (dispatchSignal === 'GAZE_OFF_SCREEN') {
                            toast.warning('Please keep your eyes on the exam screen.', {
                                description:
                                    'Ensure your face is centered and you are looking at the content.',
                            });
                        } else if (dispatchSignal === 'NO_FACE_DETECTED') {
                            toast.warning('Face not detected.', {
                                description: 'Please make sure you are visible to the camera.',
                            });
                        } else if (dispatchSignal === 'MULTIPLE_FACES') {
                            toast.warning('Multiple faces detected.', {
                                description: 'Please ensure you are alone during the exam.',
                            });
                        }

                        setActiveIncident({
                            eventType: dispatchSignal,
                            detectedAt: new Date().toISOString(),
                            analysis: normalizedAnalysis,
                        });
                        void emitMediaPipeTelemetryEvent(apiClient, {
                            configuration: resolvedConfiguration,
                            mediaPipeSandbox: sandbox,
                            examSessionId: sessionId,
                            studentId: resolvedStudentId,
                            eventType: dispatchSignal,
                            metadata: {
                                durationMs: dispatch.durationMs,
                                confidenceScore: normalizedAnalysis.confidenceScore ?? undefined,
                                aggregation: dispatch.aggregation,
                            },
                        })
                            .then((didEmit) => {
                                if (!didEmit) {
                                    console.warn(
                                        '[MediaPipeTelemetry] Attempt incident was promoted but not submitted.',
                                        {
                                            eventType: dispatchSignal,
                                            examSessionId: sessionId,
                                            metadata: {
                                                durationMs: dispatch.durationMs,
                                                confidenceScore:
                                                    normalizedAnalysis.confidenceScore ?? undefined,
                                                aggregation: dispatch.aggregation,
                                            },
                                        },
                                    );
                                }
                            })
                            .catch((error) => {
                                console.error('Failed to emit MediaPipe telemetry event.', {
                                    error,
                                    eventType: dispatchSignal,
                                    examSessionId: sessionId,
                                    metadata: {
                                        durationMs: dispatch.durationMs,
                                        confidenceScore:
                                            normalizedAnalysis.confidenceScore ?? undefined,
                                        aggregation: dispatch.aggregation,
                                    },
                                });
                            });
                    }

                    animationFrameRef.current = window.requestAnimationFrame(tick);
                };

                animationFrameRef.current = window.requestAnimationFrame(tick);
            } catch (error) {
                console.error('Failed to start attempt MediaPipe monitoring.', error);
                stopRuntime();
                trackerRef.current = createMediaPipeSignalTrackerState();
                lastFrameAtRef.current = 0;
                setAnalysis(null);
                setPhase('error');
                setErrorMessage(
                    'MediaPipe monitoring could not start for this attempt. Existing browser security monitoring remains active.',
                );
            }
        }

        void start();

        return () => {
            disposed = true;
            stopRuntime();
        };
    }, [
        apiClient,
        activeExamSessionId,
        activeSandbox,
        activeStudentId,
        activationState.isValid,
        activationState.status,
        activationState.storedFlow.mediaPipeCalibrationProfile,
        baseRuntimeEnabled,
        configuration,
        examId,
        isEnabled,
        sharedStream,
        stopRuntime,
        thresholds,
    ]);

    return {
        videoRef,
        analysis,
        phase,
        errorMessage,
        activeIncident,
        dismissIncident: () => setActiveIncident(null),
        isEnabled,
    };
}
