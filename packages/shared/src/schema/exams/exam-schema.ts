import * as z from 'zod';
import { examCreateFormSchema } from './exam-create-schema';
import {
    examConfigurationSchema,
    examSettingsSchema,
    examStatusSchema,
    studentExamStatusSchema,
    questionContentSchema,
    questionSourceOriginSchema,
    questionTypeSchema,
} from './assessment-schema';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();
const cheatingTypeSchema = z.enum([
    'gaze',
    'audio',
    'tab_switch',
    'screenshot',
    'screen_record',
    'multiple',
]);
const examResultSchema = z.enum(['passed', 'failed']).nullable();

export const examSectionSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255),
    orderIndex: z.number().int().min(0),
});

export const examQuestionSchema = z.object({
    id: z.string().uuid(),
    examId: z.string().uuid(),
    sectionId: z.string().uuid().nullable().optional(),
    sourceQuestionBankQuestionId: z.string().uuid().nullable().optional(),
    sourceCollectionId: z.string().uuid().nullable().optional(),
    sourceOrigin: questionSourceOriginSchema.optional(),
    sourceFileName: z.string().nullable().optional(),
    sourcePageNumber: z.number().int().min(1).nullable().optional(),
    sourceEvidence: z.string().nullable().optional(),
    type: questionTypeSchema,
    points: z.number().int(),
    orderIndex: z.number().int().min(0),
    content: questionContentSchema,
});

export const examSummarySchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    durationMinutes: z.number().int(),
    passingScore: z.number().int(),
    status: examStatusSchema,
    subjectId: z.string().uuid().nullable(),
    subjectTitle: z.string().nullable(),
    sectionId: z.string().uuid().nullable(),
    sectionIds: z.array(z.string().uuid()).optional(),
    sectionName: z.string().nullable(),
    roomId: z.string().uuid().nullable(),
    roomName: z.string().nullable(),
    scheduledDate: nullableDateTimeSchema,
    endDateTime: nullableDateTimeSchema,
    publishedAt: nullableDateTimeSchema,
    questionCount: z.number().int().min(0),
    createdAt: nullableDateTimeSchema,
    updatedAt: nullableDateTimeSchema,
    attemptId: z.string().uuid().nullable().optional(),
    completedAt: nullableDateTimeSchema.optional(),
    score: z.number().int().nullable().optional(),
    totalScore: z.number().int().nullable().optional(),
    percentage: z.number().int().min(0).max(100).nullable().optional(),
    timeSpentMinutes: z.number().int().nullable().optional(),
    cheated: z.boolean().optional(),
    cheatingType: cheatingTypeSchema.nullable().optional(),
    incidentCount: z.number().int().min(0).optional(),
});

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
    sourceCollectionId: z.string().uuid().nullable().optional(),
    sourceOrigin: questionSourceOriginSchema.optional(),
    sourceFileName: z.string().nullable().optional(),
    sourcePageNumber: z.number().int().min(1).nullable().optional(),
    sourceEvidence: z.string().nullable().optional(),
    type: questionTypeSchema,
    points: z.number().int().min(1).max(100),
    orderIndex: z.number().int().min(0),
    content: questionContentSchema,
});

export const getExamsQuerySchema = z.object({
    search: z.string().optional(),
    status: examStatusSchema.optional(),
    subjectId: z.string().uuid().optional(),
    institutionId: z.string().uuid().optional(),
});

export const examIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const examHistoryAttemptParamsSchema = z.object({
    attemptId: z.string().uuid(),
});

export const examHistorySummarySchema = z.object({
    id: z.string(),
    attemptId: z.string().uuid().nullable(),
    examId: z.string().uuid(),
    examTitle: z.string(),
    subject: z.string(),
    sectionIds: z.array(z.string().uuid()).optional(),
    sectionName: z.string().nullable(),
    status: studentExamStatusSchema,
    result: examResultSchema,
    availableAt: nullableDateTimeSchema,
    dueAt: nullableDateTimeSchema,
    completedAt: nullableDateTimeSchema,
    score: z.number().int().nullable(),
    totalScore: z.number().int().nullable(),
    percentage: z.number().int().min(0).max(100).nullable(),
    timeSpent: z.number().int().nullable(),
    cheated: z.boolean(),
    cheatingType: cheatingTypeSchema.nullable(),
    incidentCount: z.number().int().min(0),
});

export const examHistoryDetailSchema = examHistorySummarySchema.extend({
    durationMinutes: z.number().int(),
    passingScore: z.number().int(),
    roomName: z.string().nullable(),
});

export const createExamBodySchema = examCreateFormSchema.safeExtend({
    subjectId: z.string().uuid(),
    institutionId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    sectionIds: z.array(z.string().uuid()),
    settings: examSettingsSchema.optional(),
    configuration: examConfigurationSchema.optional(),
    questionSections: z.array(examSectionInputSchema).optional(),
    questions: z.array(examQuestionInputSchema).optional(),
});

export const updateExamBodySchema = z.object({
    institutionId: z.string().uuid().optional(),
    title: z.string().min(4).max(100).optional(),
    description: z.string().min(20).max(250).optional(),
    status: examStatusSchema.optional(),
    subjectId: z.string().uuid().nullable().optional(),
    sectionId: z.string().uuid().nullable().optional(),
    sectionIds: z.array(z.string().uuid()).optional(),
    roomId: z.string().uuid().nullable().optional(),
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
});

export const updateExamStatusBodySchema = z.object({
    status: examStatusSchema,
});
