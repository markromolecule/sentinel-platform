import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { MediaPipeFrameAnalysis } from '@sentinel/shared';
import type { ExamConfig } from '@sentinel/shared/types';

/**
 * Maps MediaPipe's normalized landmarks to a simple x,y,z structure for shared analysis.
 */
export function mapNormalizedLandmarksToMediaPipeLandmarks(
    landmarksByFace: NormalizedLandmark[][],
) {
    return landmarksByFace.map((landmarks) =>
        landmarks.map((landmark) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
        })),
    );
}

/**
 * Safe utility to attach a MediaStream to a video element and handle autoplay.
 */
export function attachMediaPipeStreamToVideo(
    videoElement: HTMLVideoElement | null,
    stream: MediaStream,
) {
    if (!videoElement) {
        return;
    }

    videoElement.srcObject = stream;

    const playPromise = videoElement.play();

    if (typeof playPromise?.catch === 'function') {
        void playPromise.catch(() => undefined);
    }
}

/**
 * Normalizes low-confidence analysis results based on exam configuration.
 * If face detection is required, low confidence is treated as a "no-face" signal.
 */
export function normalizeAttemptMediaPipeAnalysis(args: {
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
