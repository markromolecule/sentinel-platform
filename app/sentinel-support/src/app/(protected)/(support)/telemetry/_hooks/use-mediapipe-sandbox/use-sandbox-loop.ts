import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import {
    analyzeMediaPipeFrame,
    buildMediaPipeTelemetryPayload,
    evaluateMediaPipeSignalDispatch,
    type MediaPipeSupportedEventType,
    type MediaPipeTelemetrySessionContext,
    type MediaPipeThresholdResolution,
    type TelemetrySettings,
} from '@sentinel/shared';
import { drawOverlay } from '../../_utils/drawing';
import { mapNormalizedLandmarksToMediaPipeLandmarks } from '../../_utils/landmarks';
import { useSandboxRefs } from './use-sandbox-refs';
import { useSandboxState } from './use-sandbox-state';

export type UseSandboxLoopArgs = {
    refs: ReturnType<typeof useSandboxRefs>;
    actions: ReturnType<typeof useSandboxState>['actions'];
    settingsRef: React.RefObject<TelemetrySettings['mediaPipeSandbox']>;
    sessionContext: MediaPipeTelemetrySessionContext | undefined;
    thresholds: Record<MediaPipeSupportedEventType, MediaPipeThresholdResolution>;
};

export function useSandboxLoop({
    refs,
    actions,
    settingsRef,
    sessionContext,
    thresholds,
}: UseSandboxLoopArgs) {
    // Destructure refs into local variables to avoid "modifying hook arguments" error
    const {
        videoRef,
        canvasRef,
        lastSampledAtRef,
        lastVideoTimestampMsRef,
        faceLandmarkerRef,
        hasShownFrameAnalysisWarningRef,
        stableReadyFramesRef,
        trackerRef,
        animationFrameRef,
        videoFrameCallbackRef,
    } = refs;

    const {
        setAnalysis,
        setLastUpdatedAt,
        setCalibrationProgress,
        setIsCalibrated,
        setErrorMessage,
        setLatestPayload,
    } = actions;

    const tickRef = useRef<(metadata?: VideoFrameCallbackMetadata) => void>(null);

    const scheduleNextTick = useCallback(() => {
        const video = videoRef.current;

        if (!video) {
            animationFrameRef.current = window.requestAnimationFrame(() => tickRef.current?.());
            return;
        }

        if (typeof video.requestVideoFrameCallback === 'function') {
            videoFrameCallbackRef.current = video.requestVideoFrameCallback((_now, metadata) => {
                videoFrameCallbackRef.current = null;
                tickRef.current?.(metadata);
            });
            return;
        }

        animationFrameRef.current = window.requestAnimationFrame(() => tickRef.current?.());
    }, [animationFrameRef, videoFrameCallbackRef, videoRef]);

    const tick = useCallback(
        (frameMetadata?: VideoFrameCallbackMetadata) => {
            const activeSettings = settingsRef.current;
            const now = performance.now();

            if (now - lastSampledAtRef.current < activeSettings.frameIntervalMs) {
                scheduleNextTick();
                return;
            }

            const video = videoRef.current;
            const faceLandmarker = faceLandmarkerRef.current;

            if (
                !video ||
                !faceLandmarker ||
                video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
                video.videoWidth === 0 ||
                video.videoHeight === 0
            ) {
                scheduleNextTick();
                return;
            }

            const frameTimestampMs = Math.round(
                (frameMetadata?.mediaTime ?? video.currentTime) * 1000,
            );

            if (!Number.isFinite(frameTimestampMs) || frameTimestampMs <= 0) {
                scheduleNextTick();
                return;
            }

            if (frameTimestampMs <= lastVideoTimestampMsRef.current) {
                scheduleNextTick();
                return;
            }

            lastSampledAtRef.current = now;
            lastVideoTimestampMsRef.current = frameTimestampMs;

            let result: FaceLandmarkerResult;

            try {
                result = faceLandmarker.detectForVideo(video, frameTimestampMs);
            } catch {
                lastVideoTimestampMsRef.current = -1;
                if (!hasShownFrameAnalysisWarningRef.current) {
                    hasShownFrameAnalysisWarningRef.current = true;
                    setErrorMessage(
                        'MediaPipe could not analyze the current camera frame yet. Keep the sandbox open while the camera stream stabilizes.',
                    );
                }
                scheduleNextTick();
                return;
            }

            const landmarksByFace = (result.faceLandmarks ?? []).map(
                mapNormalizedLandmarksToMediaPipeLandmarks,
            );

            if (hasShownFrameAnalysisWarningRef.current) {
                hasShownFrameAnalysisWarningRef.current = false;
                setErrorMessage(null);
            }

            const nextAnalysis = analyzeMediaPipeFrame({
                landmarksByFace,
                confidenceThreshold: activeSettings.confidenceThreshold,
            });

            setAnalysis(nextAnalysis);
            setLastUpdatedAt(new Date().toISOString());

            // Track calibration progress
            if (nextAnalysis.status === 'ready') {
                stableReadyFramesRef.current += 1;
            } else {
                stableReadyFramesRef.current = 0;
            }

            const stableFrames = stableReadyFramesRef.current;
            const nextProgress = Math.min(100, Math.round((stableFrames / 6) * 100));
            setCalibrationProgress(nextProgress);
            setIsCalibrated(stableFrames >= 6);

            const dispatch = evaluateMediaPipeSignalDispatch({
                currentSignal: nextAnalysis.signal,
                tracker: trackerRef.current,
                nowMs: Date.now(),
                thresholds,
            });

            trackerRef.current = dispatch.tracker;

            if (dispatch.shouldEmit && nextAnalysis.signal) {
                setLatestPayload(
                    buildMediaPipeTelemetryPayload({
                        examSessionId: '00000000-0000-4000-8000-000000000001',
                        studentId: '00000000-0000-4000-8000-000000000002',
                        eventType: nextAnalysis.signal,
                        metadata: {
                            durationMs: dispatch.durationMs,
                            confidenceScore: nextAnalysis.confidenceScore ?? undefined,
                            aggregation: dispatch.aggregation,
                        },
                        sessionContext,
                    }),
                );
            }

            drawOverlay({
                canvas: canvasRef.current,
                video,
                landmarksByFace,
                analysis: nextAnalysis,
                overlayEnabled: activeSettings.debugOverlayEnabled,
            });

            scheduleNextTick();
        },
        [
            scheduleNextTick,
            settingsRef,
            lastSampledAtRef,
            videoRef,
            faceLandmarkerRef,
            lastVideoTimestampMsRef,
            hasShownFrameAnalysisWarningRef,
            stableReadyFramesRef,
            trackerRef,
            thresholds,
            sessionContext,
            canvasRef,
            setAnalysis,
            setLastUpdatedAt,
            setCalibrationProgress,
            setIsCalibrated,
            setErrorMessage,
            setLatestPayload,
        ],
    );

    useLayoutEffect(() => {
        tickRef.current = tick;
    }, [tick]);

    return useMemo(() => ({ tick, scheduleNextTick }), [tick, scheduleNextTick]);
}
