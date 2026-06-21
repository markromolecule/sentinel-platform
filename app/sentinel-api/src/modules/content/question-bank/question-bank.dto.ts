import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';
import { questionRecordSchema } from '../question/question.dto';

export const questionBankCollectionSchema = z
    .object(Schema.questionBankCollectionSchema.shape)
    .openapi('QuestionBankCollection');

export const questionBankCollectionDetailSchema = questionBankCollectionSchema.extend({
    questions: z.array(questionRecordSchema),
});

export const getQuestionBankCollectionsSchema = {
    request: {
        query: Schema.getQuestionBankCollectionsQuerySchema,
    },
    response: z.object({
        message: z.string(),
        data: Schema.questionBankCollectionPageSchema,
    }),
};

export const getQuestionBankCollectionByIdSchema = {
    params: Schema.questionBankCollectionIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const createQuestionBankCollectionSchema = {
    body: Schema.createQuestionBankCollectionBodySchema,
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const updateQuestionBankCollectionSchema = {
    params: Schema.questionBankCollectionIdParamsSchema,
    body: Schema.updateQuestionBankCollectionBodySchema,
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const mutateQuestionBankCollectionQuestionsSchema = {
    params: Schema.questionBankCollectionIdParamsSchema,
    body: Schema.mutateQuestionBankCollectionQuestionsBodySchema,
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const deleteQuestionBankCollectionSchema = {
    params: Schema.questionBankCollectionIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type GetQuestionBankCollectionsQuery = z.infer<
    typeof getQuestionBankCollectionsSchema.request.query
>;
export type GetQuestionBankCollectionByIdParams = z.infer<
    typeof getQuestionBankCollectionByIdSchema.params
>;
export type CreateQuestionBankCollectionBody = z.infer<
    typeof createQuestionBankCollectionSchema.body
>;
export type UpdateQuestionBankCollectionParams = z.infer<
    typeof updateQuestionBankCollectionSchema.params
>;
export type UpdateQuestionBankCollectionBody = z.infer<
    typeof updateQuestionBankCollectionSchema.body
>;
export type MutateQuestionBankCollectionQuestionsParams = z.infer<
    typeof mutateQuestionBankCollectionQuestionsSchema.params
>;
export type MutateQuestionBankCollectionQuestionsBody = z.infer<
    typeof mutateQuestionBankCollectionQuestionsSchema.body
>;
export type DeleteQuestionBankCollectionParams = z.infer<
    typeof deleteQuestionBankCollectionSchema.params
>;
export type QuestionBankCollection = z.infer<typeof questionBankCollectionSchema>;
export type QuestionBankCollectionDetail = z.infer<typeof questionBankCollectionDetailSchema>;
export type QuestionBankCollectionPageRecord = z.infer<
    typeof Schema.questionBankCollectionPageSchema
>;
