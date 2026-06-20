import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examHistorySummarySchema = z
    .object(Schema.examHistorySummarySchema.shape)
    .openapi('ExamHistorySummary');

export const examHistoryDetailSchema = z
    .object(Schema.examHistoryDetailSchema.shape)
    .openapi('ExamHistoryDetail');

export const getExamHistorySchema = {
    request: {
        query: z.object({
            page: z.coerce.number().int().min(1).optional().default(1).openapi({
                description: 'Page index to fetch.',
                example: 1,
            }),
            limit: z.coerce.number().int().min(1).max(100).optional().default(10).openapi({
                description: 'Number of items per page.',
                example: 10,
            }),
            status: z.enum(['turned_in', 'past_due']).optional().openapi({
                description: 'Filter by history status.',
                example: 'turned_in',
            }),
            search: z.string().optional().openapi({
                description: 'Filter by search query.',
                example: 'midterm',
            }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(examHistorySummarySchema),
        pagination: z.object({
            page: z.number().int(),
            limit: z.number().int(),
            total: z.number().int(),
            hasMore: z.boolean(),
        }),
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
