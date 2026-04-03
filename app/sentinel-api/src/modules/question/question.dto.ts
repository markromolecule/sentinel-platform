import { z } from '@hono/zod-openapi';
import {
    questionContentSchema,
    questionInputSchema,
    questionTagsSchema,
    questionTypeSchema,
} from '../_shared/assessment-contracts';

export const questionRecordSchema = z
    .object({
        id: z.string().uuid(),
        subjectId: z.string().uuid().nullable(),
        institutionId: z.string().uuid().nullable(),
        type: questionTypeSchema,
        points: z.number().int(),
        tags: questionTagsSchema,
        content: questionContentSchema,
        prompt: z.string().nullable(),
        createdAt: z.union([z.string(), z.date()]).nullable(),
        updatedAt: z.union([z.string(), z.date()]).nullable(),
        createdBy: z.string().nullable(),
        updatedBy: z.string().nullable(),
    })
    .openapi('QuestionRecord');

export const getQuestionsSchema = {
    request: {
        query: z.object({
            search: z.string().optional(),
            type: questionTypeSchema.optional(),
            subjectId: z.string().uuid().optional(),
            institutionId: z.string().uuid().optional(),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(questionRecordSchema),
    }),
};

export const getQuestionByIdSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: questionRecordSchema,
    }),
};

export const createQuestionSchema = {
    body: questionInputSchema.extend({
        institutionId: z.string().uuid().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: questionRecordSchema,
    }),
};

export const updateQuestionSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        subjectId: z.string().uuid().optional().nullable(),
        institutionId: z.string().uuid().optional(),
        type: questionTypeSchema.optional(),
        points: z.number().int().min(1).max(100).optional(),
        tags: questionTagsSchema.optional(),
        content: questionContentSchema.optional(),
    }),
    response: z.object({
        message: z.string(),
        data: questionRecordSchema,
    }),
};

export const deleteQuestionSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
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
