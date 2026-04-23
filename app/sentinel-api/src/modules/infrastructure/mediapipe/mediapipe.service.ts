import type {
    MediaPipeLandmark,
    MediaPipeCalibrationProfile,
    MediaPipeSignalTrackerState,
    MediaPipeSupportedEventType,
    MediaPipeTelemetryMetadata,
    MediaPipeTelemetrySessionContext,
    TelemetryMediaPipeSandboxSchemaValues,
    TelemetryRuleOverrideSchemaValues,
} from '@sentinel/shared';
import { classifyMediaPipeObservation } from './services/classify-mediapipe-observation';
import { mapMediaPipeEvent } from './services/map-mediapipe-event';
import { resolveMediaPipeThresholds } from './services/resolve-mediapipe-thresholds';
import { shapeMediaPipePreviewPayload } from './services/shape-mediapipe-preview-payload';
import { shouldSuppressMediaPipeSignal } from './services/should-suppress-mediapipe-signal';

export class MediaPipeService {
    static resolveThresholds(args: {
        sandbox: TelemetryMediaPipeSandboxSchemaValues;
        ruleOverrides?: Partial<
            Record<MediaPipeSupportedEventType, TelemetryRuleOverrideSchemaValues | undefined>
        >;
    }) {
        return resolveMediaPipeThresholds(args);
    }

    static classifyObservation(args: {
        landmarksByFace: MediaPipeLandmark[][];
        confidenceScores?: Array<number | null | undefined>;
        confidenceThreshold: number;
        calibrationProfile?: MediaPipeCalibrationProfile | null;
    }) {
        return classifyMediaPipeObservation(args);
    }

    static evaluateDispatch(args: {
        currentSignal: MediaPipeSupportedEventType | null;
        tracker?: MediaPipeSignalTrackerState;
        nowMs: number;
        thresholds: ReturnType<typeof MediaPipeService.resolveThresholds>;
    }) {
        return shouldSuppressMediaPipeSignal(args);
    }

    static mapEvent(args: {
        examSessionId: string;
        studentId: string;
        eventType: MediaPipeSupportedEventType;
        metadata?: MediaPipeTelemetryMetadata;
        sessionContext?: MediaPipeTelemetrySessionContext;
        timestamp?: string;
    }) {
        return mapMediaPipeEvent(args);
    }

    static shapePreviewPayload(args: {
        eventType: MediaPipeSupportedEventType;
        metadata?: MediaPipeTelemetryMetadata;
        sessionContext?: MediaPipeTelemetrySessionContext;
    }) {
        return shapeMediaPipePreviewPayload(args);
    }
}
