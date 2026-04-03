import * as z from 'zod';
import {
    questionContentSchema,
    questionDifficultySchema,
    questionInputSchema,
    questionTagsSchema,
    questionTypeSchema,
} from './assessment-schema';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const questionRecordSchema = z.object({
    id: z.string().uuid(),
    subjectId: z.string().uuid().nullable(),
    institutionId: z.string().uuid().nullable(),
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
});

export const getQuestionsQuerySchema = z.object({
    search: z.string().optional(),
    type: questionTypeSchema.optional(),
    subjectId: z.string().uuid().optional(),
    institutionId: z.string().uuid().optional(),
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
    type: questionTypeSchema.optional(),
    difficulty: questionDifficultySchema.optional(),
    points: z.number().int().min(1).max(100).optional(),
    tags: questionTagsSchema.optional(),
    content: questionContentSchema.optional(),
});
