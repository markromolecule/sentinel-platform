import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examHistorySummarySchema = z
    .object(Schema.examHistorySummarySchema.shape)
    .openapi('ExamHistorySummary');

export const examHistoryDetailSchema = z
    .object(Schema.examHistoryDetailSchema.shape)
    .openapi('ExamHistoryDetail');

export const getExamHistorySchema = {
    response: z.object({
        message: z.string(),
        data: z.array(examHistorySummarySchema),
    }),
};

export const getExamHistoryDetailSchema = {
    params: Schema.examHistoryAttemptParamsSchema,
    response: z.object({
        message: z.string(),
        data: examHistoryDetailSchema,
    }),
};

export type ExamHistorySummary = z.infer<typeof examHistorySummarySchema>;
export type ExamHistoryDetail = z.infer<typeof examHistoryDetailSchema>;
