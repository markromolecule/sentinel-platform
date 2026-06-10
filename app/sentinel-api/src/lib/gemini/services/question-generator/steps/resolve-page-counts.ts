import { z } from 'zod';
import type { LlmFile, QuestionGeneratorLlmProvider } from '../types';

/**
 * Step 3: Queries Gemini metadata to resolve the exact page count of uploaded PDFs.
 */
export async function resolvePageCountsStep(args: {
    files: File[];
    uploadedFiles: LlmFile[];
    model: string;
    provider: QuestionGeneratorLlmProvider;
}): Promise<Array<{ fileName: string; pageCount: number }>> {
    const prompt = [
        'Analyze the attached PDF file metadata.',
        'Return the exact page count for each attached PDF.',
        'Use the exact uploaded file names listed below.',
        args.files.map((file) => `- ${file.name}`).join('\n'),
        'Return only JSON that matches the supplied schema.',
    ].join('\n');

    const generated = await args.provider.generateStructuredJson<{
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
