import * as z from 'zod';
import { questionInputSchema, questionTagsSchema } from './assessment-schema';
import { questionRecordSchema } from './question-schema';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const questionCollectionSchema = z.object({
    id: z.string().uuid(),
    institutionId: z.string().uuid().nullable(),
    name: z.string(),
    description: z.string().nullable(),
    tags: questionTagsSchema,
    isPublic: z.boolean(),
    questionCount: z.number().int().min(0),
    questionIds: z.array(z.string().uuid()),
    createdAt: nullableDateTimeSchema,
    updatedAt: nullableDateTimeSchema,
    createdBy: z.string().nullable(),
    updatedBy: z.string().nullable(),
    createdById: z.string().uuid().nullable(),
    updatedById: z.string().uuid().nullable(),
});

export const questionCollectionDetailSchema = questionCollectionSchema.extend({
    questions: z.array(questionRecordSchema),
});

export const getQuestionCollectionsQuerySchema = z.object({
    search: z.string().optional(),
    institutionId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const questionCollectionPageSchema = z.object({
    items: z.array(questionCollectionSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasMore: z.boolean(),
});

export const questionCollectionIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const createQuestionCollectionBodySchema = z.object({
    institutionId: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(1000).optional(),
    tags: questionTagsSchema.optional(),
    isPublic: z.boolean().optional(),
    questionIds: z.array(z.string().uuid()).optional(),
    questions: z.array(questionInputSchema).optional(),
});

export const updateQuestionCollectionBodySchema = z.object({
    institutionId: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    tags: questionTagsSchema.optional(),
    isPublic: z.boolean().optional(),
});

export const mutateQuestionCollectionQuestionsBodySchema = z.object({
    questionIds: z.array(z.string().uuid()).min(1),
});
