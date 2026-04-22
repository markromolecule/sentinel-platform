'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type {
    FaceLandmarker,
    FaceLandmarkerResult,
    NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import {
    analyzeMediaPipeFrame,
    calculateMediaPipeFaceBounds,
    getMediaPipeClientCapabilities,
    isMediaPipeRuntimeEnabled,
    type MediaPipeFrameAnalysis,
    type MediaPipeLandmark,
    type TelemetrySettings,
} from '@sentinel/shared';
import type { ExamConfiguration } from '@sentinel/shared/types';

const MEDIAPIPE_WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const MEDIAPIPE_MODEL_PATH =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const REQUIRED_CALIBRATION_READY_FRAMES = 6; // Approx 3 seconds at 500ms intervals

function drawOverlay(args: {
    canvas: HTMLCanvasElement | null;
    video: HTMLVideoElement | null;
    landmarksByFace: MediaPipeLandmark[][];
    analysis: MediaPipeFrameAnalysis | null;
    debugEnabled: boolean;
    isCalibrated: boolean;
}) {
    const { canvas, video, landmarksByFace, analysis, debugEnabled, isCalibrated } = args;

    if (!canvas || !video) {
        return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
        return;
    }

    if (canvas.width !== width) {
        canvas.width = width;
    }

    if (canvas.height !== height) {
        canvas.height = height;
    }

    const context = canvas.getContext('2d');

    if (!context) {
        return;
    }

    context.clearRect(0, 0, width, height);

    // Draw alignment guide if not calibrated
    if (!isCalibrated) {
        context.save();
        context.beginPath();
        context.setLineDash([8, 4]);
        context.ellipse(width * 0.5, height * 0.45, width * 0.22, height * 0.32, 0, 0, Math.PI * 2);
        context.lineWidth = 3;
        context.strokeStyle = analysis?.status === 'ready' ? '#22c55e' : 'rgba(255, 255, 255, 0.4)';
        context.stroke();

        // Label
        context.fillStyle = 'rgba(15, 23, 42, 0.7)';
        const labelText = analysis?.status === 'ready' ? 'Hold still...' : 'Align face in guide';
        const labelWidth = context.measureText(labelText).width + 24;
        context.roundRect(
            width * 0.5 - labelWidth / 2,
            height * 0.45 + height * 0.28 + 15,
            labelWidth,
            28,
            6,
        );
        context.fill();
        context.fillStyle = '#fff';
        context.font = 'bold 13px sans-serif';
        context.textAlign = 'center';
        context.fillText(labelText, width * 0.5, height * 0.45 + height * 0.28 + 34);
        context.restore();
    }

    if (!debugEnabled) {
        return;
    }

    context.lineWidth = 2;
    context.strokeStyle =
        analysis?.status === 'off-screen'
            ? '#f59e0b'
            : analysis?.status === 'multiple-faces'
              ? '#ef4444'
              : '#22c55e';
    context.fillStyle = context.strokeStyle;

    landmarksByFace.forEach((landmarks) => {
        landmarks.forEach((landmark, index) => {
            if (index % 6 !== 0) {
                return;
            }

            context.beginPath();
            context.arc(landmark.x * width, landmark.y * height, 1.5, 0, Math.PI * 2);
            context.fill();
        });

        const bounds = calculateMediaPipeFaceBounds(landmarks);

        if (!bounds) {
            return;
        }

        context.strokeRect(
            bounds.minX * width,
            bounds.minY * height,
            bounds.width * width,
            bounds.height * height,
        );
    });
}

type UseCheckupMediaPipeArgs = {
    videoRef: RefObject<HTMLVideoElement | null>;
    streamActive: boolean;
    configuration: ExamConfiguration;
    mediaPipeSandbox: TelemetrySettings['mediaPipeSandbox'];
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

export function useCheckupMediaPipe({
    videoRef,
    streamActive,
    configuration,
    mediaPipeSandbox,
}: UseCheckupMediaPipeArgs) {
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameAtRef = useRef(0);
    const [analysis, setAnalysis] = useState<MediaPipeFrameAnalysis | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [calibrationReadyFrames, setCalibrationReadyFrames] = useState(0);
    const [calibrationHoldSecondsRemaining, setCalibrationHoldSecondsRemaining] = useState(0);
    const [isCalibrated, setIsCalibrated] = useState(false);

    const isEnabled = useMemo(
        () =>
            isMediaPipeRuntimeEnabled({
                sandbox: mediaPipeSandbox,
                configuration,
                stage: 'checkup',
                hasCameraStream: streamActive,
            }),
        [configuration, mediaPipeSandbox, streamActive],
    );

    useEffect(() => {
        if (!isEnabled || !streamActive || !videoRef.current) {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            if (
                faceLandmarkerRef.current &&
                typeof faceLandmarkerRef.current.close === 'function'
            ) {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }

            setAnalysis(null);
            setErrorMessage(null);
            setCalibrationProgress(0);
            setCalibrationReadyFrames(0);
            setCalibrationHoldSecondsRemaining(0);
            setIsCalibrated(false);
            lastFrameAtRef.current = 0;
            drawOverlay({
                canvas: overlayCanvasRef.current,
                video: videoRef.current,
                landmarksByFace: [],
                analysis: null,
                debugEnabled: false,
                isCalibrated: false,
            });
            return;
        }

        let disposed = false;
        let stableReadyFrames = 0;
        let hasCompletedCalibration = false;

        async function start() {
            try {
                lastFrameAtRef.current = 0;
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
                            mediaPipeSandbox.confidenceThreshold - 0.2,
                        ),
                        minFacePresenceConfidence: Math.max(
                            0.35,
                            mediaPipeSandbox.confidenceThreshold - 0.2,
                        ),
                        minTrackingConfidence: Math.max(
                            0.35,
                            mediaPipeSandbox.confidenceThreshold - 0.2,
                        ),
                    },
                );

                const tick = () => {
                    if (disposed || !videoRef.current || !faceLandmarkerRef.current) {
                        return;
                    }

                    const now = performance.now();

                    if (now - lastFrameAtRef.current < mediaPipeSandbox.frameIntervalMs) {
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
                        confidenceThreshold: Math.max(
                            0.35,
                            mediaPipeSandbox.confidenceThreshold - 0.15,
                        ),
                        tolerateDownwardGaze: true,
                    });

                    setAnalysis(nextAnalysis);

                    const bounds = calculateMediaPipeFaceBounds(landmarksByFace[0] ?? []);
                    const isCentered =
                        bounds &&
                        Math.abs(bounds.centerX - 0.5) < 0.15 &&
                        Math.abs(bounds.centerY - 0.45) < 0.2;

                    if (!hasCompletedCalibration) {
                        if (nextAnalysis.status === 'ready' && isCentered) {
                            stableReadyFrames = Math.min(
                                REQUIRED_CALIBRATION_READY_FRAMES,
                                stableReadyFrames + 1,
                            );
                        } else {
                            stableReadyFrames = Math.max(0, stableReadyFrames - 2); // Faster drop if unaligned
                        }

                        if (stableReadyFrames >= REQUIRED_CALIBRATION_READY_FRAMES) {
                            hasCompletedCalibration = true;
                        }
                    }

                    const nextProgress = hasCompletedCalibration
                        ? 100
                        : Math.round((stableReadyFrames / REQUIRED_CALIBRATION_READY_FRAMES) * 100);
                    const remainingReadyFrames = hasCompletedCalibration
                        ? 0
                        : Math.max(REQUIRED_CALIBRATION_READY_FRAMES - stableReadyFrames, 0);
                    const nextHoldSecondsRemaining = hasCompletedCalibration
                        ? 0
                        : Number(
                              (
                                  (remainingReadyFrames * mediaPipeSandbox.frameIntervalMs) /
                                  1000
                              ).toFixed(1),
                          );
                    setCalibrationProgress(nextProgress);
                    setCalibrationReadyFrames(stableReadyFrames);
                    setCalibrationHoldSecondsRemaining(nextHoldSecondsRemaining);
                    setIsCalibrated(hasCompletedCalibration);

                    drawOverlay({
                        canvas: overlayCanvasRef.current,
                        video: videoRef.current,
                        landmarksByFace,
                        analysis: nextAnalysis,
                        debugEnabled: mediaPipeSandbox.debugOverlayEnabled,
                        isCalibrated: hasCompletedCalibration,
                    });

                    animationFrameRef.current = window.requestAnimationFrame(tick);
                };

                animationFrameRef.current = window.requestAnimationFrame(tick);
            } catch (error) {
                console.error('Failed to initialize checkup MediaPipe runtime.', error);
                setAnalysis(null);
                setCalibrationProgress(0);
                setCalibrationReadyFrames(0);
                setCalibrationHoldSecondsRemaining(0);
                setIsCalibrated(false);
                setErrorMessage(
                    'MediaPipe could not start during checkup. Refresh the page or re-allow camera access to complete calibration.',
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

            if (
                faceLandmarkerRef.current &&
                typeof faceLandmarkerRef.current.close === 'function'
            ) {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }
        };
    }, [configuration, isEnabled, mediaPipeSandbox, streamActive, videoRef]);

    return {
        overlayCanvasRef,
        analysis,
        errorMessage,
        calibrationProgress,
        calibrationReadyFrames,
        calibrationHoldSecondsRemaining,
        requiredCalibrationReadyFrames: REQUIRED_CALIBRATION_READY_FRAMES,
        isCalibrated,
        isEnabled,
        clientCapabilities: getMediaPipeClientCapabilities(),
    };
}
