import { z } from '@hono/zod-openapi';
import { questionInputSchema, questionTagsSchema } from '../_shared/assessment-contracts';
import { questionRecordSchema } from '../question/question.dto';

export const questionBankCollectionSchema = z
    .object({
        id: z.string().uuid(),
        institutionId: z.string().uuid().nullable(),
        name: z.string(),
        description: z.string().nullable(),
        tags: questionTagsSchema,
        isPublic: z.boolean(),
        questionCount: z.number().int().min(0),
        questionIds: z.array(z.string().uuid()),
        createdAt: z.union([z.string(), z.date()]).nullable(),
        updatedAt: z.union([z.string(), z.date()]).nullable(),
        createdBy: z.string().nullable(),
        updatedBy: z.string().nullable(),
    })
    .openapi('QuestionBankCollection');

export const questionBankCollectionDetailSchema = questionBankCollectionSchema.extend({
    questions: z.array(questionRecordSchema),
});

export const getQuestionBankCollectionsSchema = {
    request: {
        query: z.object({
            search: z.string().optional(),
            institutionId: z.string().uuid().optional(),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(questionBankCollectionSchema),
    }),
};

export const getQuestionBankCollectionByIdSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const createQuestionBankCollectionSchema = {
    body: z.object({
        institutionId: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(255),
        description: z.string().trim().max(1000).optional(),
        tags: questionTagsSchema.optional(),
        isPublic: z.boolean().optional(),
        questionIds: z.array(z.string().uuid()).optional(),
        questions: z.array(questionInputSchema).optional(),
    }),
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const updateQuestionBankCollectionSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        institutionId: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(255).optional(),
        description: z.string().trim().max(1000).nullable().optional(),
        tags: questionTagsSchema.optional(),
        isPublic: z.boolean().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const mutateQuestionBankCollectionQuestionsSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        questionIds: z.array(z.string().uuid()).min(1),
    }),
    response: z.object({
        message: z.string(),
        data: questionBankCollectionDetailSchema,
    }),
};

export const deleteQuestionBankCollectionSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type GetQuestionBankCollectionsQuery = z.infer<typeof getQuestionBankCollectionsSchema.request.query>;
export type GetQuestionBankCollectionByIdParams = z.infer<typeof getQuestionBankCollectionByIdSchema.params>;
export type CreateQuestionBankCollectionBody = z.infer<typeof createQuestionBankCollectionSchema.body>;
export type UpdateQuestionBankCollectionParams = z.infer<typeof updateQuestionBankCollectionSchema.params>;
export type UpdateQuestionBankCollectionBody = z.infer<typeof updateQuestionBankCollectionSchema.body>;
export type MutateQuestionBankCollectionQuestionsParams = z.infer<typeof mutateQuestionBankCollectionQuestionsSchema.params>;
export type MutateQuestionBankCollectionQuestionsBody = z.infer<typeof mutateQuestionBankCollectionQuestionsSchema.body>;
export type DeleteQuestionBankCollectionParams = z.infer<typeof deleteQuestionBankCollectionSchema.params>;
export type QuestionBankCollection = z.infer<typeof questionBankCollectionSchema>;
export type QuestionBankCollectionDetail = z.infer<typeof questionBankCollectionDetailSchema>;
