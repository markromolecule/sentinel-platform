import { z } from 'zod';
import type {
    GenerateQuestionPreviewConfig,
    GenerateQuestionPreviewResponse,
} from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { GeminiProvider, type UploadedGeminiFile } from '../../gemini.provider';
import { buildPrompt, buildResponseJsonSchema } from '../prompt-builder';
import {
    normalizeGeneratedQuestions,
    buildAiPreviewSavePayload,
    QuestionNormalizationError,
} from '../question-normalizer';
import { generateQuestionPreviewResponseSchema } from '@sentinel/shared';
import type { ExtractedPdfDocument } from './pdf-page-extractor';

// Maximum number of concurrent Gemini API calls to prevent rate-limit 429s
const CONCURRENCY_LIMIT = 3;

type RawGeneratedQuestion = {
    subjectId?: string;
    sourceFileName: string;
    sourcePageNumber: number;
    sourceEvidence: string;
    difficulty?: string;
    points?: number;
    tags?: string[];
    content: unknown;
    type: string;
    // TOS metadata
    topic?: string;
    cognitive_level?: string;
    predicted_difficulty?: string;
};

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

function normalizeFileNameForMatch(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\.pdf$/i, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function createGeminiNativeSourceDocuments(
    files: File[],
    rawQuestions: RawGeneratedQuestion[],
    sourcePageCounts: Array<{ fileName: string; pageCount: number }>,
): ExtractedPdfDocument[] {
    return files.map((file) => {
        const normalizedFileName = normalizeFileNameForMatch(file.name);
        const sourcePageCount = sourcePageCounts.find(
            (source) => normalizeFileNameForMatch(source.fileName) === normalizedFileName,
        )?.pageCount;
        const citedPageNumbers = rawQuestions
            .filter(
                (question) =>
                    normalizeFileNameForMatch(question.sourceFileName) === normalizedFileName,
            )
            .map((question) => question.sourcePageNumber);

        return {
            fileName: file.name,
            pageCount: Math.max(1, sourcePageCount ?? 1, ...citedPageNumbers),
            pages: [],
        };
    });
}

async function resolveGeminiNativeSourcePageCounts(args: {
    files: File[];
    uploadedFiles: UploadedGeminiFile[];
    model: string;
}) {
    const prompt = [
        'Analyze the attached PDF file metadata.',
        'Return the exact page count for each attached PDF.',
        'Use the exact uploaded file names listed below.',
        args.files.map((file) => `- ${file.name}`).join('\n'),
        'Return only JSON that matches the supplied schema.',
    ].join('\n');

    const generated = await GeminiProvider.generateStructuredJson<{
        documents: Array<{
            fileName: string;
            pageCount: number;
        }>;
    }>({
        model: args.model,
        prompt,
        responseJsonSchema: {
            type: 'object',
            properties: {
                documents: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            fileName: {
                                type: 'string',
                            },
                            pageCount: {
                                type: 'integer',
                                minimum: 1,
                            },
                        },
                        required: ['fileName', 'pageCount'],
                    },
                },
            },
            required: ['documents'],
        },
        files: args.uploadedFiles.map((file) => ({
            uri: file.uri,
            mimeType: file.mimeType,
        })),
    });

    return z
        .object({
            documents: z.array(
                z.object({
                    fileName: z.string().min(1),
                    pageCount: z.number().int().min(1),
                }),
            ),
        })
        .parse(generated).documents;
}

async function uploadPdfFilesToGemini(files: File[]) {
    const uploadedFiles: UploadedGeminiFile[] = [];

    try {
        for (const file of files) {
            uploadedFiles.push(
                await GeminiProvider.uploadFile({
                    buffer: Buffer.from(await file.arrayBuffer()),
                    mimeType: file.type || 'application/pdf',
                    displayName: file.name,
                }),
            );
        }

        return uploadedFiles;
    } catch (error) {
        await deleteGeminiFiles(uploadedFiles);
        throw error;
    }
}

async function deleteGeminiFiles(files: UploadedGeminiFile[]) {
    const results = await Promise.allSettled(
        files.map((file) => GeminiProvider.deleteFile(file.name)),
    );

    results.forEach((result) => {
        if (result.status === 'rejected') {
            console.error('Failed to delete Gemini uploaded file:', result.reason);
        }
    });
}

/**
 * Runs an array of Promises with a maximum concurrency limit.
 * Works like Promise.allSettled but caps simultaneous in-flight calls.
 */
async function runWithConcurrencyLimit<T>(
    promises: Promise<T>[],
    limit: number,
): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = new Array(promises.length);
    let nextIndex = 0;

    async function runNext(): Promise<void> {
        const index = nextIndex++;
        if (index >= promises.length) return;

        try {
            results[index] = { status: 'fulfilled', value: await promises[index] };
        } catch (reason) {
            results[index] = { status: 'rejected', reason };
        }

        await runNext();
    }

    const workers = Array.from({ length: Math.min(limit, promises.length) }, () => runNext());
    await Promise.all(workers);

    return results;
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
        const model = GeminiProvider.resolveFlashModel();
        const uploadedFiles = await uploadPdfFilesToGemini(args.files);

        try {
            const batchPromises = batches.map(async (batchConfig) => {
                const prompt = buildPrompt({
                    config: batchConfig,
                    sourceFiles: args.files.map((file) => ({
                        fileName: file.name,
                    })),
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
                    files: uploadedFiles.map((file) => ({
                        uri: file.uri,
                        mimeType: file.mimeType,
                    })),
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
                    // TOS metadata
                    topic: z.string().optional(),
                    cognitive_level: z.string().optional(),
                    predicted_difficulty: z.string().optional(),
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

            const batchResults = await runWithConcurrencyLimit(batchPromises, CONCURRENCY_LIMIT);
            const allRawQuestions = batchResults
                .filter(
                    (res): res is PromiseFulfilledResult<RawGeneratedQuestion[]> =>
                        res.status === 'fulfilled',
                )
                .flatMap((res) => res.value);

            if (allRawQuestions.length === 0) {
                throw new HTTPException(502, {
                    message: 'AI generation failed. All question batches returned errors.',
                });
            }

            const sourcePageCounts = await resolveGeminiNativeSourcePageCounts({
                files: args.files,
                uploadedFiles,
                model,
            });
            const sourceDocuments = createGeminiNativeSourceDocuments(
                args.files,
                allRawQuestions,
                sourcePageCounts,
            );
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
        } finally {
            await deleteGeminiFiles(uploadedFiles);
        }
    }
}
