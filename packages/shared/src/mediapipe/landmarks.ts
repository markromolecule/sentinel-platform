import { MEDIAPIPE_LANDMARK_INDEX } from './constants';
import type { MediaPipeFaceBounds, MediaPipeLandmark } from './types';

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function readLandmark(
    landmarks: MediaPipeLandmark[],
    index: (typeof MEDIAPIPE_LANDMARK_INDEX)[keyof typeof MEDIAPIPE_LANDMARK_INDEX],
) {
    return landmarks[index] ?? null;
}

export function readLandmarkByIndex(landmarks: MediaPipeLandmark[], index: number) {
    return landmarks[index] ?? null;
}

export function averageLandmark(
    landmarks: MediaPipeLandmark[],
    indices: readonly number[],
): MediaPipeLandmark | null {
    const resolved = indices
        .map((index) => readLandmarkByIndex(landmarks, index))
        .filter((landmark): landmark is MediaPipeLandmark => landmark !== null);

    if (resolved.length !== indices.length) {
        return null;
    }

    return {
        x: resolved.reduce((sum, landmark) => sum + landmark.x, 0) / resolved.length,
        y: resolved.reduce((sum, landmark) => sum + landmark.y, 0) / resolved.length,
        z: resolved.reduce((sum, landmark) => sum + (landmark.z ?? 0), 0) / resolved.length,
    } satisfies MediaPipeLandmark;
}

export function calculateLandmarkDistance(a: MediaPipeLandmark, b: MediaPipeLandmark) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function calculateMediaPipeFaceBounds(
    landmarks: MediaPipeLandmark[],
): MediaPipeFaceBounds | null {
    if (landmarks.length === 0) {
        return null;
    }

    const xValues = landmarks.map((landmark) => landmark.x);
    const yValues = landmarks.map((landmark) => landmark.y);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const width = Math.max(maxX - minX, 0);
    const height = Math.max(maxY - minY, 0);

    return {
        minX,
        minY,
        maxX,
        maxY,
        width,
        height,
        centerX: minX + width / 2,
        centerY: minY + height / 2,
    };
}

export function estimateMediaPipeConfidenceScore(landmarks: MediaPipeLandmark[]) {
    const faceBounds = calculateMediaPipeFaceBounds(landmarks);

    if (!faceBounds) {
        return null;
    }

    const faceAreaScore = clamp((faceBounds.width * faceBounds.height - 0.02) / 0.12, 0, 1);
    const edgeDistanceX = Math.abs(faceBounds.centerX - 0.5);
    const edgeDistanceY = Math.abs(faceBounds.centerY - 0.5);
    const centeringScore = clamp(1 - (edgeDistanceX * 1.4 + edgeDistanceY * 1.2), 0, 1);

    return clamp(faceAreaScore * 0.65 + centeringScore * 0.35, 0, 1);
}

/**
 * Returns whether the face center sits too close to the viewport edge.
 */
export function isMediaPipeFaceNearViewportEdge(faceBounds: MediaPipeFaceBounds | null) {
    if (!faceBounds) return false;
    const area = faceBounds.width * faceBounds.height;
    const isCloseFraming = area > 0.35;

    const centerLimitX = isCloseFraming ? 0.05 : 0.12;
    const centerLimitY = isCloseFraming ? 0.04 : 0.08;

    return (
        faceBounds.centerX < centerLimitX ||
        faceBounds.centerX > 1 - centerLimitX ||
        faceBounds.centerY < centerLimitY ||
        faceBounds.centerY > 1 - centerLimitY
    );
}

/**
 * Returns whether the visible face bounds indicate a partial face near the frame edge.
 */
export function isMediaPipePartialFaceVisible(faceBounds: MediaPipeFaceBounds | null) {
    if (!faceBounds) return false;
    const area = faceBounds.width * faceBounds.height;
    const isCloseFraming = area > 0.35;

    const edgeLimitX = isCloseFraming ? 0.01 : 0.05;
    const edgeLimitY = isCloseFraming ? 0.01 : 0.04;

    return (
        faceBounds.minX < edgeLimitX ||
        faceBounds.maxX > 1 - edgeLimitX ||
        faceBounds.minY < edgeLimitY ||
        faceBounds.maxY > 1 - edgeLimitY
    );
}
