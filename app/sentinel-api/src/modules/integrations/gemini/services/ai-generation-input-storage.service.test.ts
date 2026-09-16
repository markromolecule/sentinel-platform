import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabaseAdmin } from '../../../../lib/supabase-admin';
import {
    AI_GENERATION_MAX_INPUT_OBJECT_BYTES,
    AiGenerationInputStorageError,
    AiGenerationInputStorageService,
} from './ai-generation-input-storage.service';

vi.mock('../../../../lib/supabase-admin', () => ({
    supabaseAdmin: {
        storage: {
            from: vi.fn(),
            getBucket: vi.fn(),
        },
    },
}));

type StorageClientMock = {
    upload: ReturnType<typeof vi.fn>;
    download: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
};

describe('AiGenerationInputStorageService', () => {
    const bucket = 'ai-generation-staging';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function mockStorageClient(overrides: Partial<StorageClientMock> = {}): StorageClientMock {
        const client: StorageClientMock = {
            upload: vi.fn(),
            download: vi.fn(),
            remove: vi.fn(),
            ...overrides,
        };
        vi.mocked(supabaseAdmin.storage.from).mockReturnValue(
            client as unknown as ReturnType<typeof supabaseAdmin.storage.from>,
        );
        return client;
    }

    it('uploads PDFs under a job-scoped sanitized path and returns a manifest', async () => {
        const client = mockStorageClient({
            upload: vi.fn().mockResolvedValue({ data: { path: 'stored' }, error: null }),
        });
        const file = new File(['%PDF-1.4'], '../../Lesson One.PDF', {
            type: 'application/pdf',
        });

        const manifest = await AiGenerationInputStorageService.uploadJobInputs({
            jobId: 'job-123',
            files: [file],
            bucketName: bucket,
        });

        expect(supabaseAdmin.storage.from).toHaveBeenCalledWith(bucket);
        expect(client.upload).toHaveBeenCalledWith(
            'job-123/001-Lesson-One.PDF',
            expect.any(Buffer),
            {
                contentType: 'application/pdf',
                upsert: false,
                cacheControl: '300',
            },
        );
        expect(manifest).toEqual({
            bucket,
            objects: [
                {
                    path: 'job-123/001-Lesson-One.PDF',
                    originalName: 'Lesson-One.PDF',
                    contentType: 'application/pdf',
                    sizeBytes: file.size,
                },
            ],
        });
    });

    it('cleans up already uploaded objects when a later upload fails', async () => {
        const client = mockStorageClient({
            upload: vi
                .fn()
                .mockResolvedValueOnce({ data: { path: 'stored' }, error: null })
                .mockResolvedValueOnce({
                    data: null,
                    error: { message: 'storage timeout' },
                }),
            remove: vi.fn().mockResolvedValue({ data: [], error: null }),
        });

        await expect(
            AiGenerationInputStorageService.uploadJobInputs({
                jobId: 'job-123',
                files: [
                    new File(['%PDF-1.4 one'], 'one.pdf', { type: 'application/pdf' }),
                    new File(['%PDF-1.4 two'], 'two.pdf', { type: 'application/pdf' }),
                ],
                bucketName: bucket,
            }),
        ).rejects.toMatchObject({
            code: 'STORAGE_TRANSPORT',
            retryable: true,
        });

        expect(client.remove).toHaveBeenCalledWith(['job-123/001-one.pdf']);
    });

    it('rejects non-PDF and oversized inputs as permanent input errors', async () => {
        await expect(
            AiGenerationInputStorageService.uploadJobInputs({
                jobId: 'job-123',
                files: [new File(['plain text'], 'notes.txt', { type: 'text/plain' })],
                bucketName: bucket,
            }),
        ).rejects.toMatchObject({
            code: 'INVALID_INPUT',
            retryable: false,
        });

        const oversizedFile = new File(['x'], 'large.pdf', { type: 'application/pdf' });
        Object.defineProperty(oversizedFile, 'size', {
            value: AI_GENERATION_MAX_INPUT_OBJECT_BYTES + 1,
        });

        await expect(
            AiGenerationInputStorageService.uploadJobInputs({
                jobId: 'job-123',
                files: [oversizedFile],
                bucketName: bucket,
            }),
        ).rejects.toBeInstanceOf(AiGenerationInputStorageError);
    });

    it('downloads manifest objects back into File instances without signed URLs', async () => {
        const client = mockStorageClient({
            download: vi.fn().mockResolvedValue({
                data: new Blob(['%PDF-1.4 stored'], { type: 'application/pdf' }),
                error: null,
            }),
        });

        const files = await AiGenerationInputStorageService.downloadManifestFiles({
            bucket,
            objects: [
                {
                    path: 'job-123/001-lesson.pdf',
                    originalName: 'lesson.pdf',
                    contentType: 'application/pdf',
                    sizeBytes: 15,
                },
            ],
        });

        expect(client.download).toHaveBeenCalledWith('job-123/001-lesson.pdf');
        expect(files).toHaveLength(1);
        expect(files[0]?.name).toBe('lesson.pdf');
        expect(files[0]?.type).toBe('application/pdf');
    });

    it('treats missing objects as permanent missing input errors', async () => {
        mockStorageClient({
            download: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Object not found', statusCode: 404 },
            }),
        });

        await expect(
            AiGenerationInputStorageService.downloadManifestFiles({
                bucket,
                objects: [
                    {
                        path: 'job-123/missing.pdf',
                        originalName: 'missing.pdf',
                        contentType: 'application/pdf',
                        sizeBytes: 0,
                    },
                ],
            }),
        ).rejects.toMatchObject({
            code: 'MISSING_INPUT',
            retryable: false,
        });
    });

    it('deletes manifests idempotently', async () => {
        const client = mockStorageClient({
            remove: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Object not found', statusCode: 404 },
            }),
        });

        await expect(
            AiGenerationInputStorageService.deleteManifest({
                bucket,
                objects: [
                    {
                        path: 'job-123/missing.pdf',
                        originalName: 'missing.pdf',
                        contentType: 'application/pdf',
                        sizeBytes: 0,
                    },
                ],
            }),
        ).resolves.not.toThrow();

        expect(client.remove).toHaveBeenCalledWith(['job-123/missing.pdf']);
    });

    it('verifies private PDF-only bucket readiness', async () => {
        vi.mocked(supabaseAdmin.storage.getBucket).mockResolvedValue({
            data: {
                public: false,
                allowed_mime_types: ['application/pdf'],
                file_size_limit: AI_GENERATION_MAX_INPUT_OBJECT_BYTES,
            },
            error: null,
        } as Awaited<ReturnType<typeof supabaseAdmin.storage.getBucket>>);

        const result = await AiGenerationInputStorageService.verifyBucketReadiness(bucket);

        expect(supabaseAdmin.storage.getBucket).toHaveBeenCalledWith(bucket);
        expect(result).toEqual({
            bucketName: bucket,
            exists: true,
            isPublic: false,
            fileSizeLimitBytes: AI_GENERATION_MAX_INPUT_OBJECT_BYTES,
            allowedMimeTypes: ['application/pdf'],
            ready: true,
            issues: [],
        });
    });

    it('reports readiness issues for public buckets or weak policies', async () => {
        vi.mocked(supabaseAdmin.storage.getBucket).mockResolvedValue({
            data: {
                public: true,
                allowed_mime_types: ['image/png'],
                file_size_limit: 1024,
            },
            error: null,
        } as Awaited<ReturnType<typeof supabaseAdmin.storage.getBucket>>);

        const result = await AiGenerationInputStorageService.verifyBucketReadiness(bucket);

        expect(result.ready).toBe(false);
        expect(result.issues).toEqual([
            {
                code: 'BUCKET_PUBLIC',
                message: 'AI generation staging bucket must remain private.',
            },
            {
                code: 'MIME_TYPES_MISMATCH',
                message: 'AI generation staging bucket must allow application/pdf only.',
            },
            {
                code: 'FILE_SIZE_LIMIT_TOO_SMALL',
                message: 'AI generation staging bucket file size limit is below 15MB.',
            },
        ]);
    });
});
