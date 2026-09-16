import type { AiGenerationStorageObject } from '../data/ai-generation-job.repository';

export const AI_GENERATION_STAGING_BUCKET =
    process.env.AI_GENERATION_STAGING_BUCKET?.trim() || 'ai-generation-staging';

export const AI_GENERATION_MAX_INPUT_OBJECT_BYTES = 15 * 1024 * 1024;

export type AiGenerationInputManifest = {
    bucket: string;
    objects: AiGenerationStorageObject[];
};

export type AiGenerationInputStorageErrorCode =
    | 'INVALID_INPUT'
    | 'MISSING_INPUT'
    | 'STORAGE_TRANSPORT';

export class AiGenerationInputStorageError extends Error {
    constructor(
        readonly code: AiGenerationInputStorageErrorCode,
        message: string,
        readonly retryable: boolean,
    ) {
        super(message);
        this.name = 'AiGenerationInputStorageError';
    }
}

export type AiGenerationInputBucketReadinessIssueCode =
    | 'BUCKET_MISSING'
    | 'BUCKET_INACCESSIBLE'
    | 'BUCKET_PUBLIC'
    | 'MIME_TYPES_MISMATCH'
    | 'FILE_SIZE_LIMIT_TOO_SMALL';

export type AiGenerationInputBucketReadinessIssue = {
    code: AiGenerationInputBucketReadinessIssueCode;
    message: string;
};

export type AiGenerationInputBucketReadinessResult = {
    bucketName: string;
    exists: boolean;
    isPublic: boolean | null;
    fileSizeLimitBytes: number | null;
    allowedMimeTypes: string[];
    ready: boolean;
    issues: AiGenerationInputBucketReadinessIssue[];
};

export type BucketMetadata = {
    public?: unknown;
    allowed_mime_types?: unknown;
    file_size_limit?: unknown;
};

export type UploadJobInputsArgs = {
    jobId: string;
    files: File[];
    bucketName?: string;
};

export type DeleteObjectsArgs = {
    bucket: string;
    paths: string[];
};
