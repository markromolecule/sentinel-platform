'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
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

const MEDIAPIPE_WASM_PATH =
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const MEDIAPIPE_MODEL_PATH =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

function drawOverlay(args: {
    canvas: HTMLCanvasElement | null;
    video: HTMLVideoElement | null;
    landmarksByFace: MediaPipeLandmark[][];
    analysis: MediaPipeFrameAnalysis | null;
    enabled: boolean;
}) {
    const { canvas, video, landmarksByFace, analysis, enabled } = args;

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

    if (!enabled) {
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

export function useCheckupMediaPipe({
    videoRef,
    streamActive,
    configuration,
    mediaPipeSandbox,
}: UseCheckupMediaPipeArgs) {
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const faceLandmarkerRef = useRef<any>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameAtRef = useRef(0);
    const [analysis, setAnalysis] = useState<MediaPipeFrameAnalysis | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
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

            if (faceLandmarkerRef.current && typeof faceLandmarkerRef.current.close === 'function') {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }

            setAnalysis(null);
            setErrorMessage(null);
            setCalibrationProgress(0);
            setIsCalibrated(false);
            drawOverlay({
                canvas: overlayCanvasRef.current,
                video: videoRef.current,
                landmarksByFace: [],
                analysis: null,
                enabled: false,
            });
            return;
        }

        let disposed = false;
        let stableReadyFrames = 0;

        async function start() {
            try {
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
                        confidenceThreshold: mediaPipeSandbox.confidenceThreshold,
                    });

                    setAnalysis(nextAnalysis);

                    if (nextAnalysis.status === 'ready') {
                        stableReadyFrames += 1;
                    } else {
                        stableReadyFrames = 0;
                    }

                    const nextProgress = Math.min(100, Math.round((stableReadyFrames / 6) * 100));
                    setCalibrationProgress(nextProgress);
                    setIsCalibrated(stableReadyFrames >= 6);

                    drawOverlay({
                        canvas: overlayCanvasRef.current,
                        video: videoRef.current,
                        landmarksByFace,
                        analysis: nextAnalysis,
                        enabled: mediaPipeSandbox.debugOverlayEnabled,
                    });

                    animationFrameRef.current = window.requestAnimationFrame(tick);
                };

                animationFrameRef.current = window.requestAnimationFrame(tick);
            } catch (error) {
                console.error('Failed to initialize checkup MediaPipe runtime.', error);
                setErrorMessage(
                    'MediaPipe could not start during checkup. You can still continue unless support requires calibration.',
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
        };
    }, [configuration, isEnabled, mediaPipeSandbox, streamActive, videoRef]);

    return {
        overlayCanvasRef,
        analysis,
        errorMessage,
        calibrationProgress,
        isCalibrated,
        isEnabled,
        clientCapabilities: getMediaPipeClientCapabilities(),
    };
}
