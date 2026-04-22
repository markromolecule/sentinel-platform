import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    createMediaPipeSignalTrackerState,
    resolveMediaPipeThresholds,
    type TelemetrySettings,
} from '@sentinel/shared';
import { MEDIAPIPE_MODEL_PATH, MEDIAPIPE_WASM_PATH } from '../../_constants';
import { drawOverlay } from '../../_utils/drawing';
import { buildSessionContext } from '../../_utils/session';
import { useSandboxLoop } from './use-sandbox-loop';
import { useSandboxRefs } from './use-sandbox-refs';
import { useSandboxState } from './use-sandbox-state';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export function useSandboxEngine(settings: TelemetrySettings['mediaPipeSandbox']) {
    const { state, actions } = useSandboxState();
    const refs = useSandboxRefs();

    const {
        videoRef,
        canvasRef,
        streamRef,
        faceLandmarkerRef,
        animationFrameRef,
        videoFrameCallbackRef,
        lastSampledAtRef,
        lastVideoTimestampMsRef,
        trackerRef,
        startupSequenceRef,
        hasShownFrameAnalysisWarningRef,
        stableReadyFramesRef,
    } = refs;

    const {
        setPhase,
        setAnalysis,
        setErrorMessage,
        setIsCameraActive,
        setIsSlowInitialization,
        setCalibrationProgress,
        setIsCalibrated,
    } = actions;

    const settingsRef = useRef(settings);

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const sessionContext = useMemo(() => buildSessionContext(), []);
    const { enabled, confidenceThreshold, frameIntervalMs, debugOverlayEnabled } = settings;
    const thresholds = useMemo(
        () =>
            resolveMediaPipeThresholds({
                sandbox: {
                    ...settingsRef.current,
                    enabled,
                    confidenceThreshold,
                    frameIntervalMs,
                    debugOverlayEnabled,
                },
            }),
        [enabled, confidenceThreshold, frameIntervalMs, debugOverlayEnabled],
    );

    const { scheduleNextTick } = useSandboxLoop({
        refs,
        actions,
        settingsRef,
        sessionContext,
        thresholds,
    });

    const teardown = useCallback(() => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (videoFrameCallbackRef.current !== null && videoRef.current) {
            videoRef.current.cancelVideoFrameCallback(videoFrameCallbackRef.current);
            videoFrameCallbackRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        if (faceLandmarkerRef.current && typeof faceLandmarkerRef.current.close === 'function') {
            faceLandmarkerRef.current.close();
        }

        faceLandmarkerRef.current = null;
        lastSampledAtRef.current = 0;
        lastVideoTimestampMsRef.current = -1;
        trackerRef.current = createMediaPipeSignalTrackerState();
        hasShownFrameAnalysisWarningRef.current = false;
        stableReadyFramesRef.current = 0;
        setIsCameraActive(false);
    }, [
        animationFrameRef,
        videoFrameCallbackRef,
        videoRef,
        streamRef,
        faceLandmarkerRef,
        lastSampledAtRef,
        lastVideoTimestampMsRef,
        trackerRef,
        hasShownFrameAnalysisWarningRef,
        stableReadyFramesRef,
        setIsCameraActive,
    ]);

    useEffect(() => teardown, [teardown]);

    useEffect(() => {
        if (!settings.debugOverlayEnabled) {
            drawOverlay({
                canvas: canvasRef.current,
                video: videoRef.current,
                landmarksByFace: [],
                analysis: null,
                overlayEnabled: false,
            });
        }
    }, [settings.debugOverlayEnabled, canvasRef, videoRef]);

    const startSandbox = useCallback(async () => {
        const startupSequence = startupSequenceRef.current + 1;
        startupSequenceRef.current = startupSequence;

        if (!settingsRef.current.enabled) {
            setErrorMessage(
                'Enable the MediaPipe sandbox toggle before launching the live calibration workspace.',
            );
            return;
        }

        if (
            typeof navigator === 'undefined' ||
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            setPhase('unsupported');
            setErrorMessage(
                'This browser does not support camera capture for the MediaPipe sandbox.',
            );
            return;
        }

        setPhase('loading');
        setErrorMessage(null);
        setIsSlowInitialization(false);
        setCalibrationProgress(0);
        setIsCalibrated(false);
        hasShownFrameAnalysisWarningRef.current = false;

        const slowInitializationTimer = window.setTimeout(() => {
            setIsSlowInitialization(true);
        }, 4000);

        try {
            teardown();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user',
                },
            });

            if (startupSequenceRef.current !== startupSequence) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            streamRef.current = stream;
            setIsCameraActive(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try {
                    await videoRef.current.play();
                } catch (error: unknown) {
                    if (error instanceof Error && error.name !== 'AbortError') {
                        throw error;
                    }
                }
            }

            const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
            const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: MEDIAPIPE_MODEL_PATH,
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numFaces: 1,
                minFaceDetectionConfidence: Math.max(
                    0.35,
                    settingsRef.current.confidenceThreshold - 0.2,
                ),
                minFacePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
                outputFaceBlendshapes: true,
            });

            if (startupSequenceRef.current !== startupSequence) {
                faceLandmarker.close();
                return;
            }

            faceLandmarkerRef.current = faceLandmarker;
            window.clearTimeout(slowInitializationTimer);

            if (startupSequenceRef.current !== startupSequence) {
                teardown();
                return;
            }

            setPhase('running');
            scheduleNextTick();
        } catch (error) {
            console.error('Failed to start MediaPipe sandbox.', error);
            setPhase('error');
            setErrorMessage(
                'Unable to initialize the MediaPipe sandbox. Check camera access and browser compatibility, then try again.',
            );
            teardown();
        } finally {
            window.clearTimeout(slowInitializationTimer);
        }
    }, [
        startupSequenceRef,
        teardown,
        scheduleNextTick,
        videoRef,
        faceLandmarkerRef,
        streamRef,
        hasShownFrameAnalysisWarningRef,
        setErrorMessage,
        setPhase,
        setIsSlowInitialization,
        setCalibrationProgress,
        setIsCalibrated,
        setIsCameraActive,
    ]);

    const stopSandbox = useCallback(() => {
        startupSequenceRef.current += 1;
        teardown();
        setPhase('idle');
        setAnalysis(null);
        setErrorMessage(null);
    }, [startupSequenceRef, teardown, setPhase, setAnalysis, setErrorMessage]);

    return {
        ...state,
        ...actions,
        ...refs,
        sessionContext,
        thresholds,
        startSandbox,
        stopSandbox,
        teardown,
    };
}
