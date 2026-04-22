import { z } from '@hono/zod-openapi';
import {
    TELEMETRY_EVENT_DEFINITIONS,
    telemetryAggregationMetadataSchema as sharedTelemetryAggregationMetadataSchema,
    telemetryMetadataSchema as sharedTelemetryMetadataSchema,
    telemetryEventTypeSchema,
    telemetryPlatformSchema,
    telemetryRuleKeySchema,
    telemetrySessionContextSchema as sharedTelemetrySessionContextSchema,
    telemetrySourceSchema,
} from '@sentinel/shared';
import type { TelemetryOperationsSettings, TelemetryRuleOverride } from '@sentinel/shared/types';

export const TelemetryEventTypeSchema = telemetryEventTypeSchema;
export const TelemetryPlatformSchema = telemetryPlatformSchema;
export const TelemetrySourceSchema = telemetrySourceSchema;
export const TelemetryRuleKeySchema = telemetryRuleKeySchema;
export const telemetryMetadataSchema = z.object(sharedTelemetryMetadataSchema.shape).strict();
export const telemetrySessionContextSchema = z
    .object(sharedTelemetrySessionContextSchema.shape)
    .strict();
export const telemetryAggregationMetadataSchema = z
    .object(sharedTelemetryAggregationMetadataSchema.shape)
    .strict();

export const proctoringEventSchemaObject = {
    examSessionId: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    studentId: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    timestamp: z.string().datetime().openapi({
        example: new Date().toISOString(),
    }),
    platform: TelemetryPlatformSchema,
    source: TelemetrySourceSchema,
    ruleKey: TelemetryRuleKeySchema,
    eventType: TelemetryEventTypeSchema,
    metadata: telemetryMetadataSchema.optional().openapi({
        example: { durationMs: 1500, confidenceScore: 0.95 },
    }),
    sessionContext: telemetrySessionContextSchema.optional().openapi({
        example: {
            browser: 'Chrome 135',
            os: 'macOS 15',
            deviceType: 'DESKTOP',
            clientVersion: '1.0.0',
            clientCapabilities: ['fullscreen', 'clipboard-monitor'],
        },
    }),
};

export const proctoringEventSchemaOpenApi = z
    .object(proctoringEventSchemaObject)
    .superRefine((value, ctx) => {
        const eventDefinition = TELEMETRY_EVENT_DEFINITIONS[value.eventType];

        if (value.ruleKey !== eventDefinition.ruleKey) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['ruleKey'],
                message: `ruleKey must match ${eventDefinition.ruleKey} for ${value.eventType}.`,
            });
        }

        if (value.source !== eventDefinition.source) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['source'],
                message: `source must be ${eventDefinition.source} for ${value.eventType}.`,
            });
        }

        if (!eventDefinition.platforms.some((platform) => platform === value.platform)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['platform'],
                message: `${value.eventType} is not supported on platform ${value.platform}.`,
            });
        }
    })
    .openapi('ProctoringEvent');

export const ingestProctoringEventSchema = {
    body: proctoringEventSchemaOpenApi.strict(),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const ingestBatchProctoringEventSchema = {
    body: z
        .array(proctoringEventSchemaOpenApi.strict())
        .min(1)
        .max(500)
        .openapi('BatchProctoringEvents'),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type ProctoringEventMetadata = z.infer<typeof telemetryMetadataSchema>;
export type ProctoringEventSessionContext = z.infer<typeof telemetrySessionContextSchema>;
export type ProctoringEventBody = z.infer<typeof ingestProctoringEventSchema.body>;
export type BatchProctoringEventBody = z.infer<typeof ingestBatchProctoringEventSchema.body>;
export type IngestProctoringEventResponse = z.infer<typeof ingestProctoringEventSchema.response>;
export type TelemetryAggregationMetadata = z.infer<typeof telemetryAggregationMetadataSchema>;

export type TelemetryRuntimeSettingsSnapshot = {
    version: number;
    operations: TelemetryOperationsSettings;
    ruleOverrideApplied: TelemetryRuleOverride | null;
};

export type PersistableProctoringEvent = Omit<ProctoringEventBody, 'metadata'> & {
    metadata?: ProctoringEventMetadata & {
        aggregation?: TelemetryAggregationMetadata;
    };
    runtimeSettingsSnapshot?: TelemetryRuntimeSettingsSnapshot;
};
