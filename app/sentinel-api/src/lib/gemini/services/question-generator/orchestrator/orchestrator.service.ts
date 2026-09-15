import { z } from 'zod';
import type {
    GenerateQuestionPreviewConfig,
    GenerateQuestionPreviewResponse,
} from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { GeminiProvider } from '../../../gemini.provider';
import { QuestionNormalizationError, PassageQualityValidationError } from '../../question-normalizer';
import type { QuestionGeneratorLlmProvider } from '../types';
import { createBatches } from '../utils/create-batches';
import { uploadFilesStep, deleteUploadedFilesStep } from '../steps/upload-files';
import { generateBatchesStep } from '../steps/generate-batches';
import { resolvePageCountsStep } from '../steps/resolve-page-counts';
import { buildSourceDocumentsStep } from '../steps/build-source-documents';
import { normalizeQuestionsStep } from '../steps/normalize-questions';
import { buildResponseStep } from '../steps/build-response';
import { reconcileQuestionSlots } from '../steps/reconcile-question-slots';
import { DEFAULT_BATCH_SIZE } from './orchestrator.constants';
import { logPipelineStartup } from './orchestrator.telemetry';
import {
    replenishInitialDeficitsLoop,
    repairPassageQualityLoop,
    recoverFromBlockingFailuresLoop,
} from './orchestrator.recovery';

export class QuestionGeneratorService {
    /**
     * Orchestrates the full AI preview generation pipeline:
     * 1. Upload the PDF to Gemini Files API (or inline base64 for Vertex AI)
     * 2. Build the structured prompt + response schema
     * 3. Generate questions via Gemini
     * 4. Normalize and validate the raw output
     * 5. Run quality evaluation & targeted repair loop
     * 6. Build and return the structured preview response
     */
    static async generatePreviewFromPdf(args: {
        files: File[];
        config: GenerateQuestionPreviewConfig;
        provider?: QuestionGeneratorLlmProvider;
        onProgress?: (progress: number, step: string) => Promise<void>;
    }): Promise<GenerateQuestionPreviewResponse> {
        const provider = args.provider ?? GeminiProvider;
        const pipelineStartTime = Date.now();

        const notifyProgress = async (progress: number, step: string) => {
            if (args.onProgress) {
                try {
                    await args.onProgress(progress, step);
                } catch (err) {
                    console.error('[QuestionGeneratorService] onProgress callback error:', err);
                }
            }
        };

        await notifyProgress(5, 'Staging and reading lecture documents...');

        const batches = createBatches(args.config, DEFAULT_BATCH_SIZE);
        const totalSizeBytes = args.files.reduce((total, file) => total + file.size, 0);
        const model = provider.resolveFlashModel();

        logPipelineStartup({
            provider,
            config: args.config,
            batchCount: batches.length,
            batchSize: DEFAULT_BATCH_SIZE,
            model,
        });

        const uploadedFiles = await uploadFilesStep(args.files, provider);
        console.log(`[QuestionGeneratorService] PDF upload completed in ${Date.now() - pipelineStartTime}ms`);
        await notifyProgress(15, 'Analyzing document page counts and structure...');

        try {
            const batchStartTime = Date.now();
            const [sourcePageCounts, generationResult] = await Promise.all([
                resolvePageCountsStep({
                    files: args.files,
                    uploadedFiles,
                    model,
                    provider,
                }),
                generateBatchesStep({
                    batches,
                    files: args.files,
                    uploadedFiles,
                    model,
                    provider,
                }),
            ]);
            console.log(
                `[QuestionGeneratorService] Parallel batch generation completed in ${Date.now() - batchStartTime}ms (total elapsed: ${Date.now() - pipelineStartTime}ms)`,
            );
            await notifyProgress(70, 'Batch question generation completed...');

            const { rawQuestions: allRawQuestions } = generationResult;

            const sourceDocuments = buildSourceDocumentsStep(
                args.files,
                allRawQuestions,
                sourcePageCounts,
            );

            const normalizedQuestions = normalizeQuestionsStep(
                allRawQuestions,
                args.config,
                sourceDocuments,
            );
            await notifyProgress(75, 'Normalizing and formatting generated questions...');
            const candidateQuestions = [...normalizedQuestions.successful];

            let reconciliation = reconcileQuestionSlots(candidateQuestions, args.config);

            // 1. Replenish initial missing questions if any deficits exist
            const initialReplenishResult = await replenishInitialDeficitsLoop({
                reconciliation,
                candidateQuestions,
                config: args.config,
                files: args.files,
                uploadedFiles,
                sourceDocuments,
                model,
                provider,
            });
            reconciliation = initialReplenishResult.reconciliation;

            // 2. Assess passage quality and run targeted repairs
            await notifyProgress(85, "Evaluating passage quality and verifying Bloom's taxonomy...");
            const repairResult = await repairPassageQualityLoop({
                reconciliation,
                config: args.config,
                files: args.files,
                uploadedFiles,
                model,
                provider,
            });
            reconciliation = repairResult.reconciliation;

            // 3. Recover from persistent blocking failures if needed
            const recoveryResult = await recoverFromBlockingFailuresLoop({
                assessResult: repairResult.assessResult,
                reconciliation,
                candidateQuestions: initialReplenishResult.candidateQuestions,
                config: args.config,
                files: args.files,
                uploadedFiles,
                sourceDocuments,
                model,
                provider,
            });
            reconciliation = recoveryResult.reconciliation;

            const finalQuestions = reconciliation.slots.map((s) => s.question);
            await notifyProgress(95, 'Assembling final preview response...');

            const response = buildResponseStep({
                config: args.config,
                model,
                files: args.files,
                totalSizeBytes,
                sourceDocuments,
                normalizedQuestions: finalQuestions,
            });

            await notifyProgress(100, 'Generation completed successfully.');

            return response;
        } catch (error) {
            if (error instanceof PassageQualityValidationError) {
                console.error('AI passage quality validation error:', error.message);
                throw new HTTPException(502, {
                    message:
                        'AI passage generation did not meet quality checks. The questions could not be generated without leaking answers.',
                });
            }

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
            await deleteUploadedFilesStep(uploadedFiles, provider);
        }
    }
}
