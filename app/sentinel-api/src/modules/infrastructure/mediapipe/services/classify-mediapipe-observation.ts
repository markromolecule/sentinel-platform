import {
    analyzeMediaPipeFrame,
    normalizeMediaPipeConfidenceScore,
    type MediaPipeCalibrationProfile,
    type MediaPipeFrameAnalysis,
    type MediaPipeLandmark,
} from '@sentinel/shared';

export function classifyMediaPipeObservation(args: {
    landmarksByFace: MediaPipeLandmark[][];
    confidenceScores?: Array<number | null | undefined>;
    confidenceThreshold: number;
    calibrationProfile?: MediaPipeCalibrationProfile | null;
}): MediaPipeFrameAnalysis {
    return analyzeMediaPipeFrame({
        landmarksByFace: args.landmarksByFace,
        confidenceScores: args.confidenceScores?.map(
            (score) => normalizeMediaPipeConfidenceScore(score) ?? 0,
        ),
        confidenceThreshold: args.confidenceThreshold,
        calibrationProfile: args.calibrationProfile,
    });
}
