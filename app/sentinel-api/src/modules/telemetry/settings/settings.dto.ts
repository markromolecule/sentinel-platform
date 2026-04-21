import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    telemetrySettingsBodySchema,
    telemetrySettingsRecordSchema: telemetrySettingsRecordBodySchema,
} = Schema;

export const telemetrySettingsRecordSchemaObject = {
    ...telemetrySettingsRecordBodySchema.shape,
};

export const telemetrySettingsRecordSchema = z
    .object(telemetrySettingsRecordSchemaObject)
    .openapi('TelemetrySettingsRecord');

export const getTelemetrySettingsSchema = {
    response: z.object({
        message: z.string(),
        data: telemetrySettingsRecordSchema,
    }),
};

export const updateTelemetrySettingsSchema = {
    body: telemetrySettingsBodySchema,
    response: z.object({
        message: z.string(),
        data: telemetrySettingsRecordSchema,
    }),
};

export type GetTelemetrySettingsResponse = z.infer<typeof getTelemetrySettingsSchema.response>;
export type UpdateTelemetrySettingsBody = z.infer<typeof updateTelemetrySettingsSchema.body>;
export type UpdateTelemetrySettingsResponse = z.infer<
    typeof updateTelemetrySettingsSchema.response
>;
