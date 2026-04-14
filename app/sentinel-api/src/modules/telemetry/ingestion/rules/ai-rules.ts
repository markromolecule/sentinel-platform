import type { TelemetryEventType, TelemetryRuleKey } from '@sentinel/shared';
import type { ProctoringEventBody } from '../ingestion.dto';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import { BaseTelemetryRule, type RepeatThresholdOptions } from './abstract.rule';
import type { ImportantTelemetryDecision } from './types';

// Constants moved from telemetry-policy.service.ts
const GAZE_DURATION_THRESHOLD_MS = 3_000;
const GAZE_REPEAT_THRESHOLD: RepeatThresholdOptions = {
    threshold: 3,
    windowSeconds: 120,
};

const NO_FACE_DURATION_THRESHOLD_MS = 5_000;
const NO_FACE_REPEAT_THRESHOLD: RepeatThresholdOptions = {
    threshold: 2,
    windowSeconds: 60,
};

const AUDIO_CONFIDENCE_THRESHOLD = 0.85;
const AUDIO_REPEAT_THRESHOLD: RepeatThresholdOptions = {
    threshold: 3,
    windowSeconds: 120,
};

const MULTIPLE_FACES_CONFIDENCE_THRESHOLD = 0.8;

export class GazeTrackingRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'aiRules.gaze_tracking';
    eventTypes: TelemetryEventType[] = ['GAZE_OFF_SCREEN'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.aiRules?.gaze_tracking ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        return this.evaluateDurationOrRepeatThreshold(payload, {
            durationThresholdMs: GAZE_DURATION_THRESHOLD_MS,
            repeatThreshold: GAZE_REPEAT_THRESHOLD,
        });
    }
}

export class FaceDetectionRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'aiRules.face_detection';
    eventTypes: TelemetryEventType[] = ['NO_FACE_DETECTED'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.aiRules?.face_detection ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        return this.evaluateDurationOrRepeatThreshold(payload, {
            durationThresholdMs: NO_FACE_DURATION_THRESHOLD_MS,
            repeatThreshold: NO_FACE_REPEAT_THRESHOLD,
        });
    }
}

export class AudioAnomalyRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'aiRules.audio_anomaly_detection';
    eventTypes: TelemetryEventType[] = ['AUDIO_ANOMALY'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.aiRules?.audio_anomaly_detection ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        if (
            payload.metadata?.confidenceScore !== undefined &&
            payload.metadata.confidenceScore >= AUDIO_CONFIDENCE_THRESHOLD
        ) {
            return this.persist(payload, {
                trigger: 'confidence-threshold',
                threshold: AUDIO_CONFIDENCE_THRESHOLD,
            });
        }

        return this.evaluateRepeatThreshold(payload, AUDIO_REPEAT_THRESHOLD);
    }
}

export class MultipleFacesRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'aiRules.multiple_faces_detection';
    eventTypes: TelemetryEventType[] = ['MULTIPLE_FACES'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.aiRules?.multiple_faces_detection ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        if (
            payload.metadata?.confidenceScore === undefined ||
            payload.metadata.confidenceScore >= MULTIPLE_FACES_CONFIDENCE_THRESHOLD
        ) {
            return this.persist(payload, {
                trigger:
                    payload.metadata?.confidenceScore === undefined
                        ? 'immediate'
                        : 'confidence-threshold',
                threshold: MULTIPLE_FACES_CONFIDENCE_THRESHOLD,
            });
        }

        return { action: 'ignore' };
    }
}
