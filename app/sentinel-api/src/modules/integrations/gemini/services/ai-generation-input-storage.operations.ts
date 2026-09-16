import { supabaseAdmin } from '../../../../lib/supabase-admin';
import type { AiGenerationStorageObject } from '../data/ai-generation-job.repository';
import {
    AI_GENERATION_STAGING_BUCKET,
    AI_GENERATION_MAX_INPUT_OBJECT_BYTES,
    AiGenerationInputStorageError,
    type AiGenerationInputManifest,
    type UploadJobInputsArgs,
    type DeleteObjectsArgs,
} from './ai-generation-input-storage.types';
import {
    buildObjectPath,
    sanitizeFileName,
    isStorageNotFoundError,
    getErrorMessage,
} from './ai-generation-input-storage.utils';

/**
 * Uploads all validated PDF files to the designated staging bucket with atomic rollback on failure.
 */
export async function uploadJobInputsOperation(
    args: UploadJobInputsArgs,
): Promise<AiGenerationInputManifest> {
    const bucket = args.bucketName ?? AI_GENERATION_STAGING_BUCKET;
    const uploadedObjects: AiGenerationStorageObject[] = [];

    try {
        for (let index = 0; index < args.files.length; index += 1) {
            const file = args.files[index];
            if (!file) continue;

            if (file.type !== 'application/pdf') {
                throw new AiGenerationInputStorageError(
                    'INVALID_INPUT',
                    'Only application/pdf inputs can be staged for AI generation.',
                    false,
                );
            }

            if (file.size > AI_GENERATION_MAX_INPUT_OBJECT_BYTES) {
                throw new AiGenerationInputStorageError(
                    'INVALID_INPUT',
                    'AI generation input PDF exceeds the 15MB per-object limit.',
                    false,
                );
            }

            const path = buildObjectPath(args.jobId, index, file.name);
            const buffer = Buffer.from(await file.arrayBuffer());
            const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
                contentType: 'application/pdf',
                upsert: false,
                cacheControl: '300',
            });

            if (error) {
                throw new AiGenerationInputStorageError(
                    'STORAGE_TRANSPORT',
                    `Failed to upload AI generation input: ${error.message}`,
                    true,
                );
            }

            uploadedObjects.push({
                path,
                originalName: sanitizeFileName(file.name),
                contentType: 'application/pdf',
                sizeBytes: file.size,
            });
        }

        return {
            bucket,
            objects: uploadedObjects,
        };
    } catch (error) {
        await deleteObjectsOperation({
            bucket,
            paths: uploadedObjects.map((object) => object.path),
        }).catch(() => undefined);

        if (error instanceof AiGenerationInputStorageError) {
            throw error;
        }

        throw new AiGenerationInputStorageError(
            'STORAGE_TRANSPORT',
            `Failed to upload AI generation inputs: ${getErrorMessage(error)}`,
            true,
        );
    }
}

/**
 * Downloads all input PDF files specified in an AI generation manifest and reconstructs File objects.
 */
export async function downloadManifestFilesOperation(
    manifest: AiGenerationInputManifest,
): Promise<File[]> {
    const files: File[] = [];

    for (const object of manifest.objects) {
        const { data, error } = await supabaseAdmin.storage
            .from(manifest.bucket)
            .download(object.path);

        if (error || !data) {
            throw new AiGenerationInputStorageError(
                isStorageNotFoundError(error) ? 'MISSING_INPUT' : 'STORAGE_TRANSPORT',
                `Failed to download AI generation input: ${error?.message || 'missing object'}`,
                !isStorageNotFoundError(error),
            );
        }

        const buffer =
            typeof data.arrayBuffer === 'function'
                ? Buffer.from(await data.arrayBuffer())
                : Buffer.from(data as unknown as ArrayBuffer);

        files.push(
            new File([buffer], object.originalName, {
                type: object.contentType,
            }),
        );
    }

    return files;
}

/**
 * Deletes objects from a Supabase storage bucket idempotently.
 */
export async function deleteObjectsOperation(args: DeleteObjectsArgs): Promise<void> {
    if (args.paths.length === 0) return;

    const { error } = await supabaseAdmin.storage.from(args.bucket).remove(args.paths);
    if (error && !isStorageNotFoundError(error)) {
        throw new AiGenerationInputStorageError(
            'STORAGE_TRANSPORT',
            `Failed to delete AI generation inputs: ${error.message}`,
            true,
        );
    }
}

/**
 * Deletes all objects recorded in an AI generation manifest.
 */
export async function deleteManifestOperation(
    manifest: AiGenerationInputManifest,
): Promise<void> {
    await deleteObjectsOperation({
        bucket: manifest.bucket,
        paths: manifest.objects.map((object) => object.path),
    });
}
