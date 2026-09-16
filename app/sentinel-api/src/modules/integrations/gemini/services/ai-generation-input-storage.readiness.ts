import { supabaseAdmin } from '../../../../lib/supabase-admin';
import {
    AI_GENERATION_STAGING_BUCKET,
    AI_GENERATION_MAX_INPUT_OBJECT_BYTES,
    type AiGenerationInputBucketReadinessIssue,
    type AiGenerationInputBucketReadinessResult,
} from './ai-generation-input-storage.types';
import { toBucketMetadata } from './ai-generation-input-storage.utils';

export function createReadinessResult(
    bucketName: string,
    exists: boolean,
    isPublic: boolean | null,
    fileSizeLimitBytes: number | null,
    allowedMimeTypes: string[],
    issues: AiGenerationInputBucketReadinessIssue[],
): AiGenerationInputBucketReadinessResult {
    return {
        bucketName,
        exists,
        isPublic,
        fileSizeLimitBytes,
        allowedMimeTypes,
        ready: issues.length === 0,
        issues,
    };
}

/**
 * Inspects Supabase Storage bucket metadata to verify:
 * - Bucket existence and accessibility via service-role key
 * - Bucket is private (not public)
 * - Allowed MIME types strictly match application/pdf
 * - File size limit is at least 15MB
 */
export async function verifyBucketReadinessOperation(
    bucketName = AI_GENERATION_STAGING_BUCKET,
): Promise<AiGenerationInputBucketReadinessResult> {
    const issues: AiGenerationInputBucketReadinessIssue[] = [];

    try {
        const { data, error } = await supabaseAdmin.storage.getBucket(bucketName);

        if (error) {
            issues.push({
                code: 'BUCKET_INACCESSIBLE',
                message:
                    'Unable to read AI generation staging bucket metadata with the service-role client.',
            });

            return createReadinessResult(bucketName, false, null, null, [], issues);
        }

        const metadata = toBucketMetadata(data);
        if (!metadata) {
            issues.push({
                code: 'BUCKET_MISSING',
                message: 'AI generation staging bucket metadata was not returned.',
            });

            return createReadinessResult(bucketName, false, null, null, [], issues);
        }

        const isPublic = Boolean(metadata.public);
        const allowedMimeTypes = Array.isArray(metadata.allowed_mime_types)
            ? metadata.allowed_mime_types.filter(
                (value: unknown): value is string => typeof value === 'string',
            )
            : [];
        const fileSizeLimitBytes =
            typeof metadata.file_size_limit === 'number' ? metadata.file_size_limit : null;

        if (isPublic) {
            issues.push({
                code: 'BUCKET_PUBLIC',
                message: 'AI generation staging bucket must remain private.',
            });
        }

        if (allowedMimeTypes.length !== 1 || allowedMimeTypes[0] !== 'application/pdf') {
            issues.push({
                code: 'MIME_TYPES_MISMATCH',
                message: 'AI generation staging bucket must allow application/pdf only.',
            });
        }

        if (
            fileSizeLimitBytes === null ||
            Number.isNaN(fileSizeLimitBytes) ||
            fileSizeLimitBytes < AI_GENERATION_MAX_INPUT_OBJECT_BYTES
        ) {
            issues.push({
                code: 'FILE_SIZE_LIMIT_TOO_SMALL',
                message: 'AI generation staging bucket file size limit is below 15MB.',
            });
        }

        return createReadinessResult(
            bucketName,
            true,
            isPublic,
            fileSizeLimitBytes,
            allowedMimeTypes,
            issues,
        );
    } catch {
        issues.push({
            code: 'BUCKET_INACCESSIBLE',
            message:
                'Unable to read AI generation staging bucket metadata with the service-role client.',
        });

        return createReadinessResult(bucketName, false, null, null, [], issues);
    }
}
