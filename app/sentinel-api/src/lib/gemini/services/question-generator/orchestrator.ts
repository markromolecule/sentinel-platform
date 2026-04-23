import { z } from 'zod';
import type {
    GenerateQuestionPreviewConfig,
    GenerateQuestionPreviewResponse,
} from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { GeminiProvider } from '../../gemini.provider';
import { buildPrompt, buildResponseJsonSchema } from '../prompt-builder';
import {
    normalizeGeneratedQuestions,
    buildAiPreviewSavePayload,
    QuestionNormalizationError,
} from '../question-normalizer';
import { generateQuestionPreviewResponseSchema } from '@sentinel/shared';
import {
    assertPdfDocumentsContainExtractableText,
    extractPdfDocuments,
} from './pdf-page-extractor';

function createBatches(
    config: GenerateQuestionPreviewConfig,
    batchSize: number,
): GenerateQuestionPreviewConfig[] {
    const batches: GenerateQuestionPreviewConfig[] = [];
    const distribution = config.questionTypeDistribution ?? [];

    if (distribution.length > 0) {
        const remainingDist = distribution.map((d) => ({ ...d }));

        while (remainingDist.some((d) => d.count > 0)) {
            const currentBatchDist: GenerateQuestionPreviewConfig['questionTypeDistribution'] = [];
            let currentBatchCount = 0;

            for (const dist of remainingDist) {
                if (dist.count > 0 && currentBatchCount < batchSize) {
                    const take = Math.min(dist.count, batchSize - currentBatchCount);
                    dist.count -= take;
                    currentBatchCount += take;
                    currentBatchDist.push({ type: dist.type, count: take });
                }
            }

            batches.push({
                ...config,
                questionCount: currentBatchCount,
                questionTypeDistribution: currentBatchDist,
            });
        }
    } else {
        let remainingAmount = config.questionCount;
        while (remainingAmount > 0) {
            const take = Math.min(remainingAmount, batchSize);
            remainingAmount -= take;
            batches.push({
                ...config,
                questionCount: take,
            });
        }
    }

    return batches;
}

/**
 * Orchestrates the full AI preview generation pipeline.
 */
export class QuestionGeneratorService {
    /**
     * Orchestrates the full AI preview generation pipeline:
     * 1. Upload the PDF to Gemini Files API
     * 2. Build the structured prompt + response schema
     * 3. Generate questions via Gemini
     * 4. Normalize and validate the raw output
     * 5. Build and return the structured preview response
     */
    static async generatePreviewFromPdf(args: {
        files: File[];
        config: GenerateQuestionPreviewConfig;
    }): Promise<GenerateQuestionPreviewResponse> {
        const BATCH_SIZE = 15;
        const batches = createBatches(args.config, BATCH_SIZE);
        const totalSizeBytes = args.files.reduce((total, file) => total + file.size, 0);
        const sourceDocuments = await extractPdfDocuments(args.files);
        assertPdfDocumentsContainExtractableText(sourceDocuments);
        const model = GeminiProvider.resolveFlashModel();

        try {
            const batchPromises = batches.map(async (batchConfig) => {
                const prompt = buildPrompt({
                    config: batchConfig,
                    sourceDocuments,
                });

                const generated = await GeminiProvider.generateStructuredJson<
                    Record<
                        string,
                        Array<{
                            subjectId?: string;
                            sourceFileName: string;
                            sourcePageNumber: number;
                            sourceEvidence: string;
                            difficulty?: string;
                            points?: number;
                            tags?: string[];
                            content: unknown;
                        }>
                    >
                >({
                    model,
                    prompt,
                    responseJsonSchema: buildResponseJsonSchema(batchConfig),
                });

                const itemSchema = z.object({
                    subjectId: z.string().optional(),
                    sourceFileName: z.string().min(1),
                    sourcePageNumber: z.number().int().min(1),
                    sourceEvidence: z.string().min(1),
                    difficulty: z.string().optional(),
                    points: z.number().int().optional(),
                    tags: z.array(z.string()).optional(),
                    content: z.unknown(),
                });

                const parsed = z
                    .record(z.string(), z.array(itemSchema).default([]))
                    .parse(generated);

                const flatQuestions = Object.entries(parsed).flatMap(([type, items]) => {
                    return items.map((item) => ({
                        ...item,
                        type,
                    }));
                });

                return flatQuestions;
            });

            const batchResults = await Promise.allSettled(batchPromises);
            const allRawQuestions = batchResults
                .filter((res): res is PromiseFulfilledResult<any[]> => res.status === 'fulfilled')
                .flatMap((res) => res.value);

            if (allRawQuestions.length === 0) {
                throw new HTTPException(502, {
                    message: 'AI generation failed. All question batches returned errors.',
                });
            }

            // AI occasionally generates more or slightly fewer questions than requested.
            // We slice to the requested count or take what we have.
            const questionsToNormalize = allRawQuestions.slice(0, args.config.questionCount);
            const normalizedQuestions = normalizeGeneratedQuestions(
                questionsToNormalize,
                args.config,
                sourceDocuments,
            );

            const savePayload = buildAiPreviewSavePayload({
                normalizedQuestions,
                config: args.config,
                fileName:
                    args.files.length === 1 ? args.files[0].name : `${args.files.length} files`,
            });

            return generateQuestionPreviewResponseSchema.parse({
                target: args.config.target,
                model,
                saveEndpoint:
                    args.config.target === 'QUESTION_BANK'
                        ? '/question-bank/collections'
                        : '/question-collection/collections',
                sourceFile: {
                    name:
                        args.files.length === 1
                            ? args.files[0].name
                            : `${args.files.length} files (${args.files[0].name} + ${args.files.length - 1} more)`,
                    mimeType: 'application/pdf',
                    sizeBytes: totalSizeBytes,
                },
                pageCount: sourceDocuments.reduce(
                    (total, document) => total + document.pageCount,
                    0,
                ),
                questions: normalizedQuestions,
                savePayload,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('AI preview validation error:', error.flatten());
                throw new HTTPException(502, {
                    message:
                        'Gemini returned data that did not match the required question schema.',
                });
            }

            if (
                error instanceof QuestionNormalizationError ||
                (error instanceof HTTPException && error.status === 400)
            ) {
                console.error('AI preview validation error:', {
                    message: error.message,
                });
                throw new HTTPException(502, {
                    message:
                        'Gemini returned data that did not match the required question schema.',
                });
            }

            throw error;
        }
    }
}
