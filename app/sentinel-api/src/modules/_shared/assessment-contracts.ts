import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';
import type { QuestionType } from '@sentinel/shared/types';

export const QUESTION_TYPES = [
    'MULTIPLE_CHOICE',
    'MULTIPLE_RESPONSE',
    'TRUE_FALSE',
    'IDENTIFICATION',
    'MATCHING',
    'ESSAY',
    'FILL_BLANK',
    'ENUMERATION',
] as const;

export const EXAM_STATUSES = [
    'draft',
    'published',
    'archived',
    'scheduled',
    'available',
    'completed',
    'in-progress',
    'upcoming',
    'active',
] as const;

export const questionTypeSchema = z.enum(QUESTION_TYPES);
export const questionContentSchema = z.record(z.string(), z.any()).openapi({
    example: {
        prompt: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 'Paris',
    },
});
export const questionTagsSchema = z.array(z.string().trim().min(1)).default([]);

export const examSettingsSchema = z.object({
    shuffleQuestions: z.boolean().default(false),
    showCorrectAnswers: z.boolean().default(false),
    allowReview: z.boolean().default(false),
    randomizeChoices: z.boolean().default(false),
});

export const examConfigurationSchema = z.object({
    maxReconnectAttempts: z.number().int().min(0).default(3),
    strictMode: z.boolean().default(true),
    cameraRequired: z.boolean().default(true),
    micRequired: z.boolean().default(true),
    screenLock: z.boolean().default(true),
    autoSubmitTimeoutMinutes: z.number().int().min(0).default(5),
    allowedDevices: z.array(z.string()).default([]),
    aiRules: z.record(z.string(), z.boolean()).default({
        gaze_tracking: true,
        tab_switching: true,
        face_detection: true,
        audio_detection: true,
    }),
});

export const examStatusSchema = z.enum(EXAM_STATUSES);

export const questionInputSchema = z.object({
    subjectId: z.string().uuid().optional(),
    type: questionTypeSchema,
    points: z.number().int().min(1).max(100).default(1),
    tags: questionTagsSchema.optional(),
    content: questionContentSchema,
});

export function validateQuestionContentByType(type: QuestionType, content: unknown) {
    const schema = Schema.questionContentSchemaByType[type];
    return schema.parse(content);
}

export function mapExamStatusToDb(status: (typeof EXAM_STATUSES)[number]) {
    return status.toUpperCase().replace('-', '_');
}

export function mapExamStatusFromDb(status?: string | null) {
    return (status?.toLowerCase().replace('_', '-') ?? 'draft') as (typeof EXAM_STATUSES)[number];
}
