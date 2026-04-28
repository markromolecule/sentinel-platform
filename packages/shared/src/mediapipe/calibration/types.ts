import type { MediaPipeLandmark } from '../types';

/**
 * Raw eye landmark sample for a single eye.
 * Used internally by eye-state and gaze-offset modules.
 */
export type MediaPipeEyeSample = {
    cornerA: MediaPipeLandmark | null;
    cornerB: MediaPipeLandmark | null;
    upperPoints: Array<MediaPipeLandmark | null>;
    lowerPoints: Array<MediaPipeLandmark | null>;
};

/**
 * Horizontal and vertical bounds of a single eye window.
 * Used internally for iris offset calculation.
 */
export type MediaPipeGazeWindow = {
    minX: number;
    maxX: number;
    upperCenter: MediaPipeLandmark;
    lowerCenter: MediaPipeLandmark;
    centerX: number;
};
