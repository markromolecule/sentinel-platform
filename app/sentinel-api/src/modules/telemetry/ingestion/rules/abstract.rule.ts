import type { TelemetryAggregationMetadata } from '../ingestion.dto';
import { telemetryAggregationService } from '../services/telemetry-aggregation.service';
import type { ImportantTelemetryDecision, TelemetryRule } from './types';
import type { ProctoringEventBody } from '../ingestion.dto';
import type { TelemetryEventType, TelemetryRuleKey } from '@sentinel/shared';
import type { TelemetryRuleOverride } from '@sentinel/shared/types';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';

export type RepeatThresholdOptions = {
    threshold: number;
    windowSeconds: number;
};

export abstract class BaseTelemetryRule implements TelemetryRule {
    abstract ruleKey: TelemetryRuleKey;
    abstract eventTypes: TelemetryEventType[];

    abstract isEnabled(config: ExamConfigurationValues): boolean;
    abstract evaluate(
        payload: ProctoringEventBody,
        runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision>;

    protected persist(
        payload: ProctoringEventBody,
        aggregation: TelemetryAggregationMetadata,
    ): ImportantTelemetryDecision {
        return {
            action: 'persist',
            payload: {
                ...payload,
                metadata: {
                    ...(payload.metadata ?? {}),
                    aggregation,
                },
            },
        };
    }

    protected async evaluateRepeatThreshold(
        payload: ProctoringEventBody,
        options: RepeatThresholdOptions,
    ): Promise<ImportantTelemetryDecision> {
        const count = await telemetryAggregationService.incrementWindowCount(
            payload,
            options.windowSeconds,
        );

        if (count === null || count !== options.threshold) {
            return { action: 'ignore' };
        }

        return this.persist(payload, {
            trigger: 'repeat-threshold',
            occurrenceCount: count,
            windowSeconds: options.windowSeconds,
            threshold: options.threshold,
        });
    }

    protected async evaluateDurationOrRepeatThreshold(
        payload: ProctoringEventBody,
        options: {
            durationThresholdMs: number;
            repeatThreshold: RepeatThresholdOptions;
        },
    ): Promise<ImportantTelemetryDecision> {
        if (
            payload.metadata?.durationMs !== undefined &&
            payload.metadata.durationMs >= options.durationThresholdMs
        ) {
            return this.persist(payload, {
                trigger: 'duration-threshold',
                threshold: options.durationThresholdMs,
            });
        }

        return this.evaluateRepeatThreshold(payload, options.repeatThreshold);
    }

    protected getConfidenceThreshold(
        fallback: number,
        runtimeOverride?: TelemetryRuleOverride,
    ): number {
        return runtimeOverride?.confidenceThreshold ?? fallback;
    }

    protected getDurationThreshold(
        fallback: number,
        runtimeOverride?: TelemetryRuleOverride,
    ): number {
        return runtimeOverride?.durationThresholdMs ?? fallback;
    }

    protected getRepeatThreshold(
        fallback: RepeatThresholdOptions,
        runtimeOverride?: TelemetryRuleOverride,
    ): RepeatThresholdOptions {
        return {
            ...fallback,
            threshold: runtimeOverride?.repeatThreshold ?? fallback.threshold,
        };
    }
}
