import { z } from 'zod';
import { Schema, aiPreviewSavePayloadSchema } from '@sentinel/shared';
import type { GenerateQuestionPreviewConfig, AiPreviewSavePayload } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { validateQuestionContentByType } from '@/modules/examination/assessment/assessment-contracts';
import { getQuestionTypeDistribution, QUESTION_TYPE_LABELS } from '../prompt-builder';
import { normalizeEnumToken, QUESTION_DIFFICULTY_ALIASES, QUESTION_TYPE_ALIASES } from './aliases';
import { dedupe } from './coercion';
import { normalizeQuestionContentShape } from './content-shape';

const rawGeneratedQuestionSchema = z.object({
    subjectId: z.string().optional(),
    type: z.string().optional(),
    difficulty: z.string().optional(),
    points: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
    content: z.unknown(),
});

function stripPdfExtension(fileName: string) {
    return fileName.replace(/\.pdf$/i, '');
}

function normalizeDifficulty(
    difficulty: unknown,
    configDifficulty?: GenerateQuestionPreviewConfig['difficulty'],
): z.infer<typeof Schema.questionDifficultySchema> {
    if (configDifficulty) {
        return configDifficulty;
    }

    if (typeof difficulty !== 'string' || difficulty.trim().length === 0) {
        return 'MODERATE';
    }

    return QUESTION_DIFFICULTY_ALIASES[normalizeEnumToken(difficulty)] ?? 'MODERATE';
}

function resolveQuestionType(
    rawType: string | undefined,
    config: GenerateQuestionPreviewConfig,
): z.infer<typeof Schema.questionTypeSchema> {
    const requestedTypes = getQuestionTypeDistribution(config).map((item) => item.type);

    if (requestedTypes.length === 1) {
        return requestedTypes[0];
    }

    if (!rawType) {
        throw new HTTPException(400, {
            message: 'Generated question type is missing.',
        });
    }

    const normalizedType = QUESTION_TYPE_ALIASES[normalizeEnumToken(rawType)];

    if (!normalizedType || !requestedTypes.includes(normalizedType)) {
        throw new HTTPException(400, {
            message: `Generated question type "${rawType}" is not allowed by the preview config.`,
        });
    }

    return normalizedType;
}

/**
 * Validates and normalizes the raw AI-generated question list into typed,
 * application-ready question inputs.
 */
export function normalizeGeneratedQuestions(
    rawQuestions: Array<z.infer<typeof rawGeneratedQuestionSchema>>,
    config: GenerateQuestionPreviewConfig,
) {
    return rawQuestions.map((rawQuestion) => {
        const question = rawGeneratedQuestionSchema.parse(rawQuestion);
        const resolvedType = resolveQuestionType(question.type, config);
        const normalizedContent = normalizeQuestionContentShape(resolvedType, question.content);
        const validatedContent = validateQuestionContentByType(resolvedType, normalizedContent);

        return Schema.questionInputSchema.parse({
            ...question,
            type: resolvedType,
            subjectId: config.subjectId ?? question.subjectId,
            difficulty: normalizeDifficulty(question.difficulty, config.difficulty),
            points: config.points ?? question.points ?? 1,
            tags: dedupe(question.tags ?? []),
            content: validatedContent,
        });
    });
}

/**
 * Builds the `savePayload` object that a client can use to persist the
 * AI-generated questions as a collection.
 */
export function buildAiPreviewSavePayload(args: {
    normalizedQuestions: Array<z.infer<typeof Schema.questionInputSchema>>;
    config: GenerateQuestionPreviewConfig;
    fileName: string;
}): AiPreviewSavePayload {
    const { normalizedQuestions, config, fileName } = args;

    const collectionTags = dedupe(
        config.tags.length > 0
            ? config.tags
            : normalizedQuestions.flatMap((question) => question.tags ?? []),
    );
    const distribution = getQuestionTypeDistribution(config);

    const defaultName =
        distribution.length === 1
            ? `${QUESTION_TYPE_LABELS[distribution[0].type]
                  .split(' ')
                  .map((part) => part[0]?.toUpperCase() + part.slice(1))
                  .join(' ')} Questions - ${stripPdfExtension(fileName)}`
            : `Mixed Question Types - ${stripPdfExtension(fileName)}`;

    return aiPreviewSavePayloadSchema.parse({
        institutionId: config.institutionId,
        name: config.name?.trim() || defaultName,
        description:
            config.description?.trim() || `AI-generated from ${fileName}. Review before saving.`,
        tags: collectionTags,
        isPublic: config.isPublic,
        questions: normalizedQuestions,
    });
}
