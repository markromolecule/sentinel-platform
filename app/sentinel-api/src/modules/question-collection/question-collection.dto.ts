import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';
import { questionRecordSchema } from '../question/question.dto';

export const questionCollectionSchema = z
    .object(Schema.questionCollectionSchema.shape)
    .openapi('QuestionCollection');

export const questionCollectionDetailSchema = questionCollectionSchema.extend({
    questions: z.array(questionRecordSchema),
});

export const getQuestionCollectionsSchema = {
    request: {
        query: Schema.getQuestionCollectionsQuerySchema,
    },
    response: z.object({
        message: z.string(),
        data: z.array(questionCollectionSchema),
    }),
};

export const getQuestionCollectionByIdSchema = {
    params: Schema.questionCollectionIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: questionCollectionDetailSchema,
    }),
};

export const createQuestionCollectionSchema = {
    body: Schema.createQuestionCollectionBodySchema,
    response: z.object({
        message: z.string(),
        data: questionCollectionDetailSchema,
    }),
};

export const updateQuestionCollectionSchema = {
    params: Schema.questionCollectionIdParamsSchema,
    body: Schema.updateQuestionCollectionBodySchema,
    response: z.object({
        message: z.string(),
        data: questionCollectionDetailSchema,
    }),
};

export const mutateQuestionCollectionQuestionsSchema = {
    params: Schema.questionCollectionIdParamsSchema,
    body: Schema.mutateQuestionCollectionQuestionsBodySchema,
    response: z.object({
        message: z.string(),
        data: questionCollectionDetailSchema,
    }),
};

export const deleteQuestionCollectionSchema = {
    params: Schema.questionCollectionIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type GetQuestionCollectionsQuery = z.infer<
    typeof getQuestionCollectionsSchema.request.query
>;
export type GetQuestionCollectionByIdParams = z.infer<
    typeof getQuestionCollectionByIdSchema.params
>;
export type CreateQuestionCollectionBody = z.infer<typeof createQuestionCollectionSchema.body>;
export type UpdateQuestionCollectionParams = z.infer<typeof updateQuestionCollectionSchema.params>;
export type UpdateQuestionCollectionBody = z.infer<typeof updateQuestionCollectionSchema.body>;
export type MutateQuestionCollectionQuestionsParams = z.infer<
    typeof mutateQuestionCollectionQuestionsSchema.params
>;
export type MutateQuestionCollectionQuestionsBody = z.infer<
    typeof mutateQuestionCollectionQuestionsSchema.body
>;
export type DeleteQuestionCollectionParams = z.infer<typeof deleteQuestionCollectionSchema.params>;
export type QuestionCollection = z.infer<typeof questionCollectionSchema>;
export type QuestionCollectionDetail = z.infer<typeof questionCollectionDetailSchema>;
