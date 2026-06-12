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
import { LogsService } from '../../general/logs/logs.service';

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

    static async logLandmarkAnalysis(
        dbClient: any,
        args: {
            attemptId: string;
            studentId: string;
            institutionId: string;
            gazeDirection: string;
            headPoseRotation: any;
            eyesClosedSecs: number;
        },
    ) {
        try {
            await LogsService.createLog(dbClient, {
                userId: args.studentId,
                action: 'infrastructure.face_landmark_analyzed',
                resourceType: 'mediapipe',
                resourceId: args.attemptId,
                activeInstitutionId: args.institutionId,
                details: {
                    attemptId: args.attemptId,
                    gazeDirection: args.gazeDirection,
                    headPoseRotation: args.headPoseRotation,
                    eyesClosedSecs: args.eyesClosedSecs,
                },
            });
        } catch (logErr) {
            console.error('Failed to log MediaPipe landmark analysis:', logErr);
        }
    }
}
