import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { MediaPipeLandmark } from '@sentinel/shared';

export function mapNormalizedLandmarksToMediaPipeLandmarks(landmarks: NormalizedLandmark[]) {
    return landmarks.map(
        (landmark): MediaPipeLandmark => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
        }),
    );
}
