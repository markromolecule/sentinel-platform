import {
    MEDIAPIPE_ATTEMPT_PERSISTENCE_DURATION_MS,
    type TelemetryEventType,
    type TelemetryRuleKey,
} from '@sentinel/shared';
import type { TelemetryRuleOverride } from '@sentinel/shared/types';
import type { ProctoringEventBody } from '../ingestion.dto';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import { BaseTelemetryRule, type RepeatThresholdOptions } from './abstract.rule';
import type { ImportantTelemetryDecision } from './types';

// Constants moved from telemetry-policy.service.ts
const GAZE_DURATION_THRESHOLD_MS = MEDIAPIPE_ATTEMPT_PERSISTENCE_DURATION_MS;
const GAZE_REPEAT_THRESHOLD: RepeatThresholdOptions = {
    threshold: 3,
    windowSeconds: 120,
};

const NO_FACE_DURATION_THRESHOLD_MS = MEDIAPIPE_ATTEMPT_PERSISTENCE_DURATION_MS;
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

    async evaluate(
        payload: ProctoringEventBody,
        runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        return this.evaluateDurationOrRepeatThreshold(payload, {
            durationThresholdMs: this.getDurationThreshold(
                GAZE_DURATION_THRESHOLD_MS,
                runtimeOverride,
            ),
            repeatThreshold: this.getRepeatThreshold(GAZE_REPEAT_THRESHOLD, runtimeOverride),
        });
    }
}

export class FaceDetectionRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'aiRules.face_detection';
    eventTypes: TelemetryEventType[] = ['NO_FACE_DETECTED'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.aiRules?.face_detection ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        return this.evaluateDurationOrRepeatThreshold(payload, {
            durationThresholdMs: this.getDurationThreshold(
                NO_FACE_DURATION_THRESHOLD_MS,
                runtimeOverride,
            ),
            repeatThreshold: this.getRepeatThreshold(NO_FACE_REPEAT_THRESHOLD, runtimeOverride),
        });
    }
}

export class AudioAnomalyRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'aiRules.audio_anomaly_detection';
    eventTypes: TelemetryEventType[] = ['AUDIO_ANOMALY'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.aiRules?.audio_anomaly_detection ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        const confidenceThreshold = this.getConfidenceThreshold(
            AUDIO_CONFIDENCE_THRESHOLD,
            runtimeOverride,
        );

        if (
            payload.metadata?.confidenceScore !== undefined &&
            payload.metadata.confidenceScore >= confidenceThreshold
        ) {
            return this.persist(payload, {
                trigger: 'confidence-threshold',
                threshold: confidenceThreshold,
            });
        }

        return this.evaluateRepeatThreshold(
            payload,
            this.getRepeatThreshold(AUDIO_REPEAT_THRESHOLD, runtimeOverride),
        );
    }
}

export class MultipleFacesRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'aiRules.multiple_faces_detection';
    eventTypes: TelemetryEventType[] = ['MULTIPLE_FACES'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.aiRules?.multiple_faces_detection ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        const confidenceThreshold = this.getConfidenceThreshold(
            MULTIPLE_FACES_CONFIDENCE_THRESHOLD,
            runtimeOverride,
        );

        if (
            payload.metadata?.confidenceScore === undefined ||
            payload.metadata.confidenceScore >= confidenceThreshold
        ) {
            return this.persist(payload, {
                trigger:
                    payload.metadata?.confidenceScore === undefined
                        ? 'immediate'
                        : 'confidence-threshold',
                threshold: confidenceThreshold,
            });
        }

        return { action: 'ignore' };
    }
}
