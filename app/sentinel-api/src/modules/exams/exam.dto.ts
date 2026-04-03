import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';
import {
    examConfigurationSchema,
    examSettingsSchema,
    examStatusSchema,
    questionContentSchema,
    questionTypeSchema,
} from '../_shared/assessment-contracts';

export const examSectionSchema = z
    .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255),
        orderIndex: z.number().int().min(0),
    })
    .openapi('ExamSection');

export const examQuestionSchema = z
    .object({
        id: z.string().uuid(),
        examId: z.string().uuid(),
        sectionId: z.string().uuid().nullable().optional(),
        sourceQuestionBankQuestionId: z.string().uuid().nullable().optional(),
        type: questionTypeSchema,
        points: z.number().int(),
        orderIndex: z.number().int().min(0),
        content: questionContentSchema,
    })
    .openapi('ExamQuestion');

export const examSummarySchema = z
    .object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string().nullable(),
        durationMinutes: z.number().int(),
        passingScore: z.number().int(),
        status: examStatusSchema,
        subjectId: z.string().uuid().nullable(),
        subjectTitle: z.string().nullable(),
        sectionId: z.string().uuid().nullable(),
        sectionName: z.string().nullable(),
        scheduledDate: z.union([z.string(), z.date()]).nullable(),
        endDateTime: z.union([z.string(), z.date()]).nullable(),
        publishedAt: z.union([z.string(), z.date()]).nullable(),
        questionCount: z.number().int().min(0),
        createdAt: z.union([z.string(), z.date()]).nullable(),
        updatedAt: z.union([z.string(), z.date()]).nullable(),
    })
    .openapi('ExamSummary');

export const examDetailSchema = examSummarySchema.extend({
    settings: examSettingsSchema,
    configuration: examConfigurationSchema,
    questionSections: z.array(examSectionSchema),
    questions: z.array(examQuestionSchema),
});

export const examSectionInputSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(255),
    orderIndex: z.number().int().min(0),
});

export const examQuestionInputSchema = z.object({
    id: z.string().uuid().optional(),
    sectionId: z.string().uuid().nullable().optional(),
    sourceQuestionBankQuestionId: z.string().uuid().nullable().optional(),
    type: questionTypeSchema,
    points: z.number().int().min(1).max(100),
    orderIndex: z.number().int().min(0),
    content: questionContentSchema,
});

export const getExamsSchema = {
    request: {
        query: z.object({
            search: z.string().optional(),
            status: examStatusSchema.optional(),
            subjectId: z.string().uuid().optional(),
            institutionId: z.string().uuid().optional(),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(examSummarySchema),
    }),
};

export const getExamByIdSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

export const createExamSchema = {
    body: Schema.examCreateFormSchema.extend({
        institutionId: z.string().uuid().optional(),
        sectionId: z.string().uuid().optional(),
        settings: examSettingsSchema.optional(),
        configuration: examConfigurationSchema.optional(),
        questionSections: z.array(examSectionInputSchema).optional(),
        questions: z.array(examQuestionInputSchema).optional(),
    }),
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

export const updateExamSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        institutionId: z.string().uuid().optional(),
        title: z.string().min(4).max(100).optional(),
        description: z.string().min(20).max(250).optional(),
        subjectId: z.string().uuid().nullable().optional(),
        sectionId: z.string().uuid().nullable().optional(),
        section: z.string().trim().min(1).max(100).nullable().optional(),
        startDateTime: z.string().optional(),
        endDateTime: z.string().optional(),
        durationMinutes: z.number().int().min(1).max(240).optional(),
        passingScore: z.number().int().min(0).max(100).optional(),
        shuffleQuestions: z.boolean().optional(),
        showCorrectAnswers: z.boolean().optional(),
        allowReview: z.boolean().optional(),
        randomizeChoices: z.boolean().optional(),
        settings: examSettingsSchema.partial().optional(),
        configuration: examConfigurationSchema.partial().optional(),
        questionSections: z.array(examSectionInputSchema).optional(),
        questions: z.array(examQuestionInputSchema).optional(),
    }),
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

export const updateExamStatusSchema = {
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        status: examStatusSchema,
    }),
    response: z.object({
        message: z.string(),
        data: examDetailSchema,
    }),
};

export type GetExamsQuery = z.infer<typeof getExamsSchema.request.query>;
export type GetExamByIdParams = z.infer<typeof getExamByIdSchema.params>;
export type CreateExamBody = z.infer<typeof createExamSchema.body>;
export type UpdateExamParams = z.infer<typeof updateExamSchema.params>;
export type UpdateExamBody = z.infer<typeof updateExamSchema.body>;
export type UpdateExamStatusBody = z.infer<typeof updateExamStatusSchema.body>;
export type ExamSummary = z.infer<typeof examSummarySchema>;
export type ExamDetail = z.infer<typeof examDetailSchema>;
