import { z } from '@hono/zod-openapi';
import {
    Schema,
    telemetryPlatformSchema,
    telemetrySourceSchema,
    telemetryRuleKeySchema,
    telemetryIncidentTypeSchema,
    telemetryIncidentSeveritySchema,
    telemetryIncidentStatusSchema,
} from '@sentinel/shared';

export const examIdParams = z.object({
    id: z
        .string()
        .uuid()
        .openapi({
            param: {
                name: 'id',
                in: 'path',
            },
            example: '123e4567-e89b-12d3-a456-426614174000',
        }),
});

export const getExamIncidentsQuerySchema = z.object({
    sectionId: z.string().uuid().optional(),
    studentId: z.string().optional(), // matches against userId OR studentNo OR names
    severity: telemetryIncidentSeveritySchema.optional(),
    type: telemetryIncidentTypeSchema.optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'DISMISSED']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(30),
});

export const incidentLogItemSchema = Schema.telemetryIncidentSchema.extend({
    studentNo: z.string().nullable(),
    sectionId: z.string().uuid().nullable(),
    sectionName: z.string().nullable(),
    elapsedSeconds: z.number().int().nonnegative(),
});

export const getExamIncidentsResponseSchema = z.object({
    message: z.string(),
    data: z.array(incidentLogItemSchema),
    meta: z.object({
        total: z.number().int().nonnegative(),
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
        totalPages: z.number().int().nonnegative(),
    }),
});

export const reviewExamIncidentsBodySchema = z
    .object({
        incidentIds: z.array(z.string().uuid()).min(1),
        status: z.enum(['CONFIRMED', 'DISMISSED']),
        reviewNotes: z.string().trim().max(2000).nullable().optional(),
        lifecycleAction: z.enum(['LOCK_ATTEMPT', 'CLOSE_ATTEMPT']).optional(),
        reasonCode: z.string().trim().min(1).max(120).nullable().optional(),
        notes: z.string().trim().max(2000).nullable().optional(),
    })
    .superRefine((value, ctx) => {
        if (value.lifecycleAction && value.status !== 'CONFIRMED') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['lifecycleAction'],
                message: 'Lifecycle follow-up actions are only available for confirmed incidents.',
            });
        }

        if (value.lifecycleAction && !value.reasonCode?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['reasonCode'],
                message: 'A lifecycle reason code is required when a follow-up action is selected.',
            });
        }
    });

export const reviewExamIncidentsResponseSchema = z.object({
    message: z.string(),
    data: z.object({
        updatedCount: z.number().int().nonnegative(),
        updatedAt: z.string().datetime(),
    }),
});

export type GetExamIncidentsQuery = z.infer<typeof getExamIncidentsQuerySchema>;
export type IncidentLogItem = z.infer<typeof incidentLogItemSchema>;
export type GetExamIncidentsResponse = z.infer<typeof getExamIncidentsResponseSchema>;
export type ReviewExamIncidentsBody = z.infer<typeof reviewExamIncidentsBodySchema>;
export type ReviewExamIncidentsResponse = z.infer<typeof reviewExamIncidentsResponseSchema>;
