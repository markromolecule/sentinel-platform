import {
    resolveMediaPipeThresholds as resolveSharedMediaPipeThresholds,
    type MediaPipeSupportedEventType,
    type MediaPipeThresholdResolution,
    type TelemetryMediaPipeSandboxSchemaValues,
    type TelemetryRuleOverrideSchemaValues,
} from '@sentinel/shared';

export function resolveMediaPipeThresholds(args: {
    sandbox: TelemetryMediaPipeSandboxSchemaValues;
    ruleOverrides?: Partial<
        Record<MediaPipeSupportedEventType, TelemetryRuleOverrideSchemaValues | undefined>
    >;
}): Record<MediaPipeSupportedEventType, MediaPipeThresholdResolution> {
    return resolveSharedMediaPipeThresholds(args);
}
