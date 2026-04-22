import type {
    TelemetryIngestionMode,
    TelemetryMediaPipeSandboxSchemaValues,
    TelemetryOperationsSettingsSchemaValues,
    TelemetryRuleOverrideSchemaValues,
    TelemetryRuleOverridesSchemaValues,
    TelemetrySettingsBodySchemaValues,
    TelemetrySettingsRecordSchemaValues,
    TelemetrySettingsSchemaValues,
    TelemetrySettingsVersion,
} from '../schema/telemetry/telemetry-settings-schema';

export type TelemetrySettingsVersionValue = TelemetrySettingsVersion;
export type TelemetryIngestionModeValue = TelemetryIngestionMode;
export type TelemetryOperationsSettings = TelemetryOperationsSettingsSchemaValues;
export type TelemetryRuleOverride = TelemetryRuleOverrideSchemaValues;
export type TelemetryRuleOverrides = TelemetryRuleOverridesSchemaValues;
export type TelemetryMediaPipeSandboxSettings = TelemetryMediaPipeSandboxSchemaValues;
export type TelemetrySettings = TelemetrySettingsSchemaValues;
export type TelemetrySettingsRecord = TelemetrySettingsRecordSchemaValues;
export type TelemetrySettingsInput = TelemetrySettingsBodySchemaValues;
