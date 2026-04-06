import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const questionRecordSchema = z
    .object(Schema.questionRecordSchema.shape)
    .openapi('QuestionRecord');

export const getQuestionsSchema = {
    request: {
        query: Schema.getQuestionsQuerySchema,
    },
    response: z.object({
        message: z.string(),
        data: Schema.questionPageSchema,
    }),
};

export const getQuestionByIdSchema = {
    params: Schema.questionIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: questionRecordSchema,
    }),
};

export const createQuestionSchema = {
    body: Schema.createQuestionBodySchema,
    response: z.object({
        message: z.string(),
        data: questionRecordSchema,
    }),
};

export const updateQuestionSchema = {
    params: Schema.questionIdParamsSchema,
    body: Schema.updateQuestionBodySchema,
    response: z.object({
        message: z.string(),
        data: questionRecordSchema,
    }),
};

export const deleteQuestionSchema = {
    params: Schema.questionIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type GetQuestionsQuery = z.infer<typeof getQuestionsSchema.request.query>;
export type GetQuestionByIdParams = z.infer<typeof getQuestionByIdSchema.params>;
export type CreateQuestionBody = z.infer<typeof createQuestionSchema.body>;
export type UpdateQuestionParams = z.infer<typeof updateQuestionSchema.params>;
export type UpdateQuestionBody = z.infer<typeof updateQuestionSchema.body>;
export type DeleteQuestionParams = z.infer<typeof deleteQuestionSchema.params>;
export type QuestionRecord = z.infer<typeof questionRecordSchema>;
export type QuestionPageRecord = z.infer<typeof Schema.questionPageSchema>;
