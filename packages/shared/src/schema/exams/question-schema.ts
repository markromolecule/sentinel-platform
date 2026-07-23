import * as z from 'zod';
import {
    questionContentSchema,
    questionDifficultySchema,
    questionInputSchema,
    passageTypeSchema,
    questionSourceOriginSchema,
    questionTagsSchema,
    questionTypeSchema,
    questionBankStatusSchema,
} from './assessment-schema';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const questionRecordSchema = z.object({
    id: z.string().uuid(),
    subjectId: z.string().uuid().nullable(),
    institutionId: z.string().uuid().nullable(),
    sourceOrigin: questionSourceOriginSchema,
    sourceFileName: z.string().nullable(),
    sourcePageNumber: z.number().int().min(1).nullable(),
    sourceEvidence: z.string().nullable(),
    passageContent: z.string().nullable(),
    passageType: passageTypeSchema.nullable(),
    type: questionTypeSchema,
    difficulty: questionDifficultySchema,
    points: z.number().int(),
    tags: questionTagsSchema,
    content: questionContentSchema,
    prompt: z.string().nullable(),
    createdAt: nullableDateTimeSchema,
    updatedAt: nullableDateTimeSchema,
    createdBy: z.string().nullable(),
    updatedBy: z.string().nullable(),
    status: questionBankStatusSchema,
});

export const getQuestionsQuerySchema = z.object({
    search: z.string().optional(),
    type: questionTypeSchema.optional(),
    difficulty: questionDifficultySchema.optional(),
    subjectId: z.string().uuid().optional(),
    institutionId: z.string().uuid().optional(),
    collectionId: z.string().uuid().optional(),
    status: questionBankStatusSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const questionPageSchema = z.object({
    items: z.array(questionRecordSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasMore: z.boolean(),
});

export const questionIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const createQuestionBodySchema = questionInputSchema.extend({
    institutionId: z.string().uuid().optional(),
});

export const updateQuestionBodySchema = z.object({
    subjectId: z.string().uuid().optional().nullable(),
    institutionId: z.string().uuid().optional(),
    sourceOrigin: questionSourceOriginSchema.optional(),
    sourceFileName: z.string().trim().min(1).max(255).nullable().optional(),
    sourcePageNumber: z.number().int().min(1).nullable().optional(),
    sourceEvidence: z.string().trim().min(1).max(1000).nullable().optional(),
    passageContent: z.string().nullable().optional(),
    passageType: passageTypeSchema.nullable().optional(),
    type: questionTypeSchema.optional(),
    difficulty: questionDifficultySchema.optional(),
    points: z.number().int().min(1).max(100).optional(),
    tags: questionTagsSchema.optional(),
    content: questionContentSchema.optional(),
    status: questionBankStatusSchema.optional(),
});

export const getQuestionTypeCountsQuerySchema = z.object({
    search: z.string().optional(),
    difficulty: questionDifficultySchema.optional(),
    subjectId: z.string().uuid().optional(),
    institutionId: z.string().uuid().optional(),
    collectionId: z.string().uuid().optional(),
    status: questionBankStatusSchema.optional(),
});

export const questionTypeCountSchema = z.object({
    type: questionTypeSchema,
    count: z.number().int().nonnegative(),
});

export const questionTypeCountsResponseSchema = z.object({
    items: z.array(questionTypeCountSchema),
    total: z.number().int().nonnegative(),
});
