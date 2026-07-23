import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const liveInspectionExamParamsSchema = z.object({
    examId: z.string().uuid(),
});

export const liveInspectionLeaseParamsSchema = z.object({
    examId: z.string().uuid(),
    leaseId: z.string().uuid(),
});

export const startLiveInspectionSchema = {
    params: liveInspectionExamParamsSchema,
    body: z.object({
        attemptId: z.string().uuid(),
        restart: z.boolean().optional().default(false),
    }),
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionStaffStatusSchema,
    }),
};

export const getLiveInspectionStatusSchema = {
    params: liveInspectionExamParamsSchema,
    query: z.object({
        attemptId: z.string().uuid().optional(),
        leaseId: z.string().uuid().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionStaffStatusSchema,
    }),
};

export const createViewerConnectionSchema = {
    params: liveInspectionLeaseParamsSchema,
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionConnectionResponseSchema,
    }),
};

export const stopLiveInspectionSchema = {
    params: liveInspectionLeaseParamsSchema,
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionStaffStatusSchema,
    }),
};

export const liveInspectionSessionBodySchema = z.object({
    sessionId: z.string().uuid(),
});

export const getStudentLiveInspectionDirectiveSchema = {
    body: liveInspectionSessionBodySchema,
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionDirectiveSchema,
    }),
};

export const createPublisherConnectionSchema = {
    body: liveInspectionSessionBodySchema.extend({
        leaseId: z.string().uuid(),
        revision: z.number().int().positive(),
    }),
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionConnectionResponseSchema,
    }),
};

export const acknowledgePublisherReadySchema = {
    body: liveInspectionSessionBodySchema.extend({
        leaseId: z.string().uuid(),
        revision: z.number().int().positive(),
    }),
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionReadyAckSchema,
    }),
};

export const acknowledgePublisherFailureSchema = {
    body: liveInspectionSessionBodySchema.extend({
        leaseId: z.string().uuid(),
        revision: z.number().int().positive(),
        errorCode: Schema.liveInspectionFailureCodeSchema,
    }),
    response: z.object({
        message: z.string(),
        data: Schema.liveInspectionFailureAckSchema,
    }),
};
