import type { LlmFile, QuestionGeneratorLlmProvider } from '../types';

/**
 * Step 1: Uploads files to Gemini File API using the injected provider.
 * Automatically handles cleaning up already uploaded files in this call if a subsequent upload fails.
 */
export async function uploadFilesStep(
    files: File[],
    provider: QuestionGeneratorLlmProvider,
): Promise<LlmFile[]> {
    const uploadedFiles: LlmFile[] = [];

    try {
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            uploadedFiles.push(
                await provider.uploadFile({
                    buffer,
                    mimeType: file.type || 'application/pdf',
                    displayName: file.name,
                }),
            );
        }

        return uploadedFiles;
    } catch (error) {
        await deleteUploadedFilesStep(uploadedFiles, provider);
        throw error;
    }
}

/**
 * Cleans up and deletes uploaded PDF references from Gemini storage.
 */
export async function deleteUploadedFilesStep(
    files: LlmFile[],
    provider: QuestionGeneratorLlmProvider,
): Promise<void> {
    const results = await Promise.allSettled(
        files.map((file) => provider.deleteFile(file.name)),
    );

    results.forEach((result) => {
        if (result.status === 'rejected') {
            console.error('Failed to delete Gemini uploaded file:', result.reason);
        }
    });
}
