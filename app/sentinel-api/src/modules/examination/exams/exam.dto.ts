import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examSectionSchema = z.object(Schema.examSectionSchema.shape).openapi('ExamSection');

export const examQuestionSchema = z.object(Schema.examQuestionSchema.shape).openapi('ExamQuestion');

export const examSummarySchema = z.object(Schema.examSummarySchema.shape).openapi('ExamSummary');
export const examHistorySummarySchema = z
    .object(Schema.examHistorySummarySchema.shape)
    .openapi('ExamHistorySummary');
export const examHistoryDetailSchema = z
    .object(Schema.examHistoryDetailSchema.shape)
    .openapi('ExamHistoryDetail');

export const examDetailSchema = examSummarySchema.extend({
    settings: Schema.examSettingsSchema,
    configuration: Schema.examConfigurationSchema,
    questionSections: z.array(examSectionSchema),
    questions: z.array(examQuestionSchema),
});

export const examSectionInputSchema = Schema.examSectionInputSchema;

export const examQuestionInputSchema = Schema.examQuestionInputSchema;

export const getExamsSchema = {
    request: {
        query: Schema.getExamsQuerySchema,
    },
    response: z.object({
        message: z.string(),
        data: z.array(examSummarySchema),
    }),
};

export const getExamByIdSchema = {
    params: Schema.examIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

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

export const createExamSchema = {
    body: Schema.createExamBodySchema,
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

export const updateExamSchema = {
    params: Schema.examIdParamsSchema,
    body: Schema.updateExamBodySchema,
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

export const updateExamStatusSchema = {
    params: Schema.examIdParamsSchema,
    body: Schema.updateExamStatusBodySchema,
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

export const deleteExamSchema = {
    params: Schema.examIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type GetExamsQuery = z.infer<typeof getExamsSchema.request.query>;
export type GetExamByIdParams = z.infer<typeof getExamByIdSchema.params>;
export type CreateExamBody = z.infer<typeof createExamSchema.body>;
export type UpdateExamParams = z.infer<typeof updateExamSchema.params>;
export type UpdateExamBody = z.infer<typeof updateExamSchema.body>;
export type UpdateExamStatusBody = z.infer<typeof updateExamStatusSchema.body>;
export type DeleteExamParams = z.infer<typeof deleteExamSchema.params>;
export type ExamSummary = z.infer<typeof examSummarySchema>;
export type ExamDetail = z.infer<typeof examDetailSchema>;
export type ExamHistorySummary = z.infer<typeof examHistorySummarySchema>;
export type ExamHistoryDetail = z.infer<typeof examHistoryDetailSchema>;
