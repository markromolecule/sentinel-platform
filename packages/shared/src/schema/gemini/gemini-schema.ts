import { z } from 'zod';
import {
    QUESTION_TYPES,
    questionInputSchema,
    questionDifficultySchema,
    questionTagsSchema,
    questionTypeSchema,
    bloomCognitiveLevelSchema,
} from '../exams/assessment-schema';
import { createQuestionBankCollectionBodySchema } from '../exams/question-bank-schema';

// ============================================================================
// ENUMS
// ============================================================================

export const aiGenerationTargetSchema = z.enum(['QUESTION_BANK', 'QUESTION_COLLECTION']);

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const questionTypeDistributionItemSchema = z.object({
    type: questionTypeSchema,
    count: z.number().int().min(1).max(100),
});

export const generateQuestionPreviewConfigSchema = z
    .object({
        target: aiGenerationTargetSchema.default('QUESTION_COLLECTION'),
        institutionId: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(255).optional(),
        description: z.string().trim().max(1000).optional(),
        tags: questionTagsSchema.default([]),
        isPublic: z.boolean().default(false),
        questionType: questionTypeSchema.optional(),
        questionTypeDistribution: z
            .array(questionTypeDistributionItemSchema)
            .min(1)
            .max(QUESTION_TYPES.length)
            .optional(),
        questionCount: z.number().int().min(1).max(100),
        difficulty: questionDifficultySchema.optional(),
        points: z.number().int().min(1).max(100).optional(),
        subjectId: z.string().uuid().optional(),
        language: z.string().trim().max(100).optional(),
        additionalInstructions: z.string().trim().max(4000).optional(),
    })
    .superRefine((value, ctx) => {
        const distribution = value.questionTypeDistribution ?? [];

        if (!value.questionType && distribution.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select at least one question type.',
                path: ['questionType'],
            });
            return;
        }

        if (distribution.length === 0) {
            return;
        }

        const seenTypes = new Set<string>();

        distribution.forEach((item, index) => {
            if (seenTypes.has(item.type)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Each question type can only be selected once.',
                    path: ['questionTypeDistribution', index, 'type'],
                });
            }

            seenTypes.add(item.type);
        });

        const totalCount = distribution.reduce((total, item) => total + item.count, 0);

        if (totalCount !== value.questionCount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Question count must match the sum of all selected question type counts.',
                path: ['questionCount'],
            });
        }
    });

// ============================================================================
// PAYLOAD / RESPONSE SCHEMAS
// ============================================================================

export const aiPreviewSavePayloadSchema = createQuestionBankCollectionBodySchema.extend({
    questions: z.array(questionInputSchema).min(1),
});

export const generateQuestionPreviewResponseSchema = z.object({
    target: aiGenerationTargetSchema,
    model: z.string(),
    saveEndpoint: z.string(),
    sourceFile: z.object({
        name: z.string(),
        mimeType: z.string(),
        sizeBytes: z.number().int().nonnegative(),
    }),
    pageCount: z.number().int().min(1),
    questions: z.array(questionInputSchema).min(1),
    savePayload: aiPreviewSavePayloadSchema,
});

// ============================================================================
// TYPES
// ============================================================================

export type AiGenerationTarget = z.infer<typeof aiGenerationTargetSchema>;
export type GenerateQuestionPreviewConfig = z.infer<typeof generateQuestionPreviewConfigSchema>;
export type AiPreviewSavePayload = z.infer<typeof aiPreviewSavePayloadSchema>;
export type GenerateQuestionPreviewResponse = z.infer<typeof generateQuestionPreviewResponseSchema>;

// TOS-enriched AI response item shape (raw Gemini output per question)
export const aiQuestionItemSchema = questionInputSchema.extend({
    topic: z.string().trim().min(1).max(255).optional(),
    cognitiveLevel: bloomCognitiveLevelSchema.optional(),
    predictedDifficulty: questionDifficultySchema.optional(),
});

export type AiQuestionItem = z.infer<typeof aiQuestionItemSchema>;
