import * as z from 'zod';
import { DEFAULT_TELEMETRY_SETTINGS } from '../../constants';
import { telemetryIncidentSeveritySchema, type TelemetryRuleKey } from './telemetry-schema';

const nullableDateSchema = z.union([z.coerce.date(), z.string()]).nullable();

export const TELEMETRY_SETTINGS_VERSIONS = [1] as const;
export const TELEMETRY_INGESTION_MODES = ['sync', 'redis'] as const;

export const telemetrySettingsVersionSchema = z.literal(TELEMETRY_SETTINGS_VERSIONS[0]);
export const telemetryIngestionModeSchema = z.enum(TELEMETRY_INGESTION_MODES);

export const telemetryOperationsSettingsSchema = z
    .object({
        enabled: z.boolean(),
        ingestionMode: telemetryIngestionModeSchema,
        batchingEnabled: z.boolean(),
        batchWindowMs: z.number().int().min(100).max(60_000),
        maxBatchSize: z.number().int().min(1).max(500),
        dedupeWindowSeconds: z.number().int().min(1).max(3600),
    })
    .strict();

export const telemetryRuleOverrideSchema = z
    .object({
        enabled: z.boolean().optional(),
        severity: telemetryIncidentSeveritySchema.optional(),
        confidenceThreshold: z.number().min(0).max(1).optional(),
        durationThresholdMs: z.number().int().min(1).max(600_000).optional(),
        repeatThreshold: z.number().int().min(1).max(100).optional(),
    })
    .strict();

const createTelemetryRuleOverrideShape = () =>
    Object.fromEntries(
        Object.keys(DEFAULT_TELEMETRY_SETTINGS.ruleOverrides).map((ruleKey) => [
            ruleKey,
            telemetryRuleOverrideSchema.default({}),
        ]),
    ) as {
        [K in TelemetryRuleKey]: z.ZodDefault<typeof telemetryRuleOverrideSchema>;
    };

export const telemetryRuleOverridesSchema = z.object(createTelemetryRuleOverrideShape()).strict();

export const telemetryMediaPipeSandboxSchema = z
    .object({
        enabled: z.boolean(),
        captureDuringCheckup: z.boolean(),
        emitDuringExam: z.boolean(),
        confidenceThreshold: z.number().min(0).max(1),
        frameIntervalMs: z.number().int().min(100).max(5000),
        offScreenDurationMs: z.number().int().min(500).max(60_000),
        calibrationRequired: z.boolean(),
        debugOverlayEnabled: z.boolean(),
    })
    .strict();

export const telemetrySettingsSchema = z
    .object({
        version: telemetrySettingsVersionSchema,
        operations: telemetryOperationsSettingsSchema,
        ruleOverrides: telemetryRuleOverridesSchema,
        mediaPipeSandbox: telemetryMediaPipeSandboxSchema,
    })
    .strict();

export const telemetrySettingsRecordSchema = z
    .object({
        category: z.string(),
        key: z.string(),
        description: z.string().nullable(),
        value: telemetrySettingsSchema,
        updatedAt: nullableDateSchema,
        updatedBy: z.string().nullable(),
    })
    .strict();

export const telemetrySettingsBodySchema = telemetrySettingsSchema.default({
    ...DEFAULT_TELEMETRY_SETTINGS,
    operations: { ...DEFAULT_TELEMETRY_SETTINGS.operations },
    ruleOverrides: { ...DEFAULT_TELEMETRY_SETTINGS.ruleOverrides },
    mediaPipeSandbox: { ...DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox },
});

export type TelemetrySettingsVersion = z.infer<typeof telemetrySettingsVersionSchema>;
export type TelemetryIngestionMode = z.infer<typeof telemetryIngestionModeSchema>;
export type TelemetryOperationsSettingsSchemaValues = z.infer<
    typeof telemetryOperationsSettingsSchema
>;
export type TelemetryRuleOverrideSchemaValues = z.infer<typeof telemetryRuleOverrideSchema>;
export type TelemetryRuleOverridesSchemaValues = z.infer<typeof telemetryRuleOverridesSchema>;
export type TelemetryMediaPipeSandboxSchemaValues = z.infer<typeof telemetryMediaPipeSandboxSchema>;
export type TelemetrySettingsSchemaValues = z.infer<typeof telemetrySettingsSchema>;
export type TelemetrySettingsRecordSchemaValues = z.infer<typeof telemetrySettingsRecordSchema>;
export type TelemetrySettingsBodySchemaValues = z.infer<typeof telemetrySettingsBodySchema>;
