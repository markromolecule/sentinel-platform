import { useMemo, useRef } from 'react';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import {
    createMediaPipeSignalTrackerState,
    type MediaPipeSignalTrackerState,
} from '@sentinel/shared';

export function useSandboxRefs() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const videoFrameCallbackRef = useRef<number | null>(null);
    const lastSampledAtRef = useRef(0);
    const lastVideoTimestampMsRef = useRef(-1);
    const trackerRef = useRef<MediaPipeSignalTrackerState>(createMediaPipeSignalTrackerState());
    const startupSequenceRef = useRef(0);
    const hasShownFrameAnalysisWarningRef = useRef(false);
    const stableReadyFramesRef = useRef(0);

    return useMemo(
        () => ({
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
        }),
        [],
    );
}
