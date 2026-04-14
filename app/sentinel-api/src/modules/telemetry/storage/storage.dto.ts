import { z } from '@hono/zod-openapi';
import {
    TelemetryPlatformSchema,
    TelemetryRuleKeySchema,
    TelemetrySourceSchema,
} from '../ingestion/ingestion.dto';
import { Schema, type TelemetryIncidentRecord } from '@sentinel/shared';

// Re-export common types from shared package
export { type TelemetryIncidentRecord } from '@sentinel/shared';

export const getTelemetryIncidentsSchema = {
    request: {
        query: z.object({
            attemptId: z.string().uuid().optional(),
            examId: z.string().uuid().optional(),
            studentId: z.string().uuid().optional(),
            institutionId: z.string().uuid().optional(),
            platform: TelemetryPlatformSchema.optional(),
            source: TelemetrySourceSchema.optional(),
            ruleKey: TelemetryRuleKeySchema.optional(),
            incidentType: Schema.telemetryIncidentSchema.shape.incidentType.optional(),
            status: Schema.telemetryIncidentStatusSchema.optional(),
            limit: z.coerce.number().int().positive().max(200).optional(),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(Schema.telemetryIncidentSchema),
    }),
};

export const getTelemetryIncidentSchema = {
    request: {
        params: z.object({
            incidentId: z.string().uuid(),
        }),
    },
    response: z.object({
        message: z.string(),
        data: Schema.telemetryIncidentSchema,
    }),
};

export const updateTelemetryIncidentSchema = {
    request: {
        params: z.object({
            incidentId: z.string().uuid(),
        }),
        body: {
            content: {
                'application/json': {
                    schema: z
                        .object({
                            status: Schema.telemetryIncidentStatusSchema.optional(),
                            evidenceUrl: z.string().url().nullable().optional(),
                            reviewNotes: z.string().trim().max(2000).nullable().optional(),
                        })
                        .refine(
                            (value) =>
                                value.status !== undefined ||
                                value.evidenceUrl !== undefined ||
                                value.reviewNotes !== undefined,
                            {
                                message: 'At least one field must be provided for update.',
                            },
                        ),
                },
            },
        },
    },
    response: z.object({
        message: z.string(),
        data: Schema.telemetryIncidentSchema,
    }),
};

export type GetTelemetryIncidentsQuery = z.infer<typeof getTelemetryIncidentsSchema.request.query>;
export type GetTelemetryIncidentsResponse = z.infer<typeof getTelemetryIncidentsSchema.response>;
export type GetTelemetryIncidentParams = z.infer<typeof getTelemetryIncidentSchema.request.params>;
export type GetTelemetryIncidentResponse = z.infer<typeof getTelemetryIncidentSchema.response>;
export type UpdateTelemetryIncidentParams = z.infer<
    typeof updateTelemetryIncidentSchema.request.params
>;
export type UpdateTelemetryIncidentBody = z.infer<
    (typeof updateTelemetryIncidentSchema.request.body.content)['application/json']['schema']
>;
export type UpdateTelemetryIncidentResponse = z.infer<
    typeof updateTelemetryIncidentSchema.response
>;
