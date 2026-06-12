import {
    type GenerateQuestionPreviewConfig,
    type GenerateQuestionPreviewResponse,
    generateQuestionPreviewResponseSchema,
} from '@sentinel/shared';
import type { ExtractedPdfDocument } from '../pdf-page-extractor';
import {
    type normalizeGeneratedQuestions,
    buildAiPreviewSavePayload,
} from '../../question-normalizer';

/**
 * Step 6: Formats the final GenerateQuestionPreviewResponse structure and validates the schema.
 */
export function buildResponseStep(args: {
    config: GenerateQuestionPreviewConfig;
    model: string;
    files: File[];
    totalSizeBytes: number;
    sourceDocuments: ExtractedPdfDocument[];
    normalizedQuestions: ReturnType<typeof normalizeGeneratedQuestions>;
}): GenerateQuestionPreviewResponse {
    const savePayload = buildAiPreviewSavePayload({
        normalizedQuestions: args.normalizedQuestions,
        config: args.config,
        fileName: args.files.length === 1 ? args.files[0].name : `${args.files.length} files`,
    });

    return generateQuestionPreviewResponseSchema.parse({
        target: args.config.target,
        model: args.model,
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
            sizeBytes: args.totalSizeBytes,
        },
        pageCount: args.sourceDocuments.reduce((total, document) => total + document.pageCount, 0),
        questions: args.normalizedQuestions,
        savePayload,
    });
}
