import {
    AI_GENERATION_STAGING_BUCKET,
    type AiGenerationInputManifest,
    type AiGenerationInputBucketReadinessResult,
    type UploadJobInputsArgs,
    type DeleteObjectsArgs,
} from './ai-generation-input-storage.types';
import { buildObjectPath } from './ai-generation-input-storage.utils';
import {
    uploadJobInputsOperation,
    downloadManifestFilesOperation,
    deleteObjectsOperation,
    deleteManifestOperation,
} from './ai-generation-input-storage.operations';
import { verifyBucketReadinessOperation } from './ai-generation-input-storage.readiness';

export * from './ai-generation-input-storage.types';
export * from './ai-generation-input-storage.utils';
export * from './ai-generation-input-storage.operations';
export * from './ai-generation-input-storage.readiness';

/**
 * Facade service for AI generation input PDF staging on Supabase Storage.
 *
 * Modularized into single-responsibility submodules:
 * - ai-generation-input-storage.types.ts: Domain models, constants, and custom errors
 * - ai-generation-input-storage.utils.ts: Path generation and error detection utilities
 * - ai-generation-input-storage.operations.ts: Upload, download, and delete operations
 * - ai-generation-input-storage.readiness.ts: Bucket configuration and health verification
 */
export class AiGenerationInputStorageService {
    /**
     * Builds a structured, job-scoped object path: `<jobId>/<index>-<sanitizedName>.pdf`
     */
    static buildObjectPath(jobId: string, index: number, originalName: string): string {
        return buildObjectPath(jobId, index, originalName);
    }

    /**
     * Uploads input PDFs to the staging bucket with atomic rollback on failure.
     */
    static async uploadJobInputs(args: UploadJobInputsArgs): Promise<AiGenerationInputManifest> {
        return uploadJobInputsOperation(args);
    }

    /**
     * Downloads staged input PDF files for an enqueued generation job.
     */
    static async downloadManifestFiles(manifest: AiGenerationInputManifest): Promise<File[]> {
        return downloadManifestFilesOperation(manifest);
    }

    /**
     * Deletes all objects in a manifest from storage.
     */
    static async deleteManifest(manifest: AiGenerationInputManifest): Promise<void> {
        return deleteManifestOperation(manifest);
    }

    /**
     * Deletes specified objects by path from a bucket.
     */
    static async deleteObjects(args: DeleteObjectsArgs): Promise<void> {
        return deleteObjectsOperation(args);
    }

    /**
     * Verifies that the staging bucket exists, is private, and has valid MIME/size limits.
     */
    static async verifyBucketReadiness(
        bucketName = AI_GENERATION_STAGING_BUCKET,
    ): Promise<AiGenerationInputBucketReadinessResult> {
        return verifyBucketReadinessOperation(bucketName);
    }
}
