import {
    analyzeMediaPipeFrame,
    normalizeMediaPipeConfidenceScore,
    type MediaPipeFrameAnalysis,
    type MediaPipeLandmark,
} from '@sentinel/shared';

export function classifyMediaPipeObservation(args: {
    landmarksByFace: MediaPipeLandmark[][];
    confidenceScores?: Array<number | null | undefined>;
    confidenceThreshold: number;
}): MediaPipeFrameAnalysis {
    return analyzeMediaPipeFrame({
        landmarksByFace: args.landmarksByFace,
        confidenceScores: args.confidenceScores?.map((score) =>
            normalizeMediaPipeConfidenceScore(score) ?? 0,
        ),
        confidenceThreshold: args.confidenceThreshold,
    });
}
