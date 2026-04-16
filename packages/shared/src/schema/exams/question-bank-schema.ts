import * as z from 'zod';
import { questionInputSchema, questionTagsSchema } from './assessment-schema';
import { questionRecordSchema } from './question-schema';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const questionBankCollectionSchema = z.object({
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
});

export const questionBankCollectionDetailSchema = questionBankCollectionSchema.extend({
    questions: z.array(questionRecordSchema),
});

export const getQuestionBankCollectionsQuerySchema = z.object({
    search: z.string().optional(),
    institutionId: z.string().uuid().optional(),
});

export const questionBankCollectionIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const createQuestionBankCollectionBodySchema = z.object({
    institutionId: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(1000).optional(),
    tags: questionTagsSchema.optional(),
    isPublic: z.boolean().optional(),
    questionIds: z.array(z.string().uuid()).optional(),
    questions: z.array(questionInputSchema).optional(),
});

export const updateQuestionBankCollectionBodySchema = z.object({
    institutionId: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    tags: questionTagsSchema.optional(),
    isPublic: z.boolean().optional(),
});

export const mutateQuestionBankCollectionQuestionsBodySchema = z
    .object({
        questionIds: z.array(z.string().uuid()).min(1).optional(),
        questions: z.array(questionInputSchema).min(1).optional(),
    })
    .refine(
        (value) => {
            return (value.questionIds?.length ?? 0) > 0 || (value.questions?.length ?? 0) > 0;
        },
        {
            message: 'Provide at least one question id or one question payload.',
        },
    );
