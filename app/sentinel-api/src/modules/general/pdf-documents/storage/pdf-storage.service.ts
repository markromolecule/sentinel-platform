import sharp from 'sharp';
import { createHash, randomUUID } from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export interface UploadedLogoMetadata {
    bucket: string;
    path: string;
    sizeBytes: number;
    hashSha256: string;
    mimeType: string;
    originalName: string;
}

export class PdfStorageService {
    static readonly PDF_ARTIFACTS_BUCKET = 'sentinel-pdf-artifacts';
    static readonly PDF_BRANDING_BUCKET = 'sentinel-pdf-assets';

    /**
     * Processes, validates, and uploads an institution branding logo to the private storage bucket.
     * Enforces size limits (2MB), format restrictions (PNG, JPEG, WebP), and dimensions limit (1000x1000px).
     *
     * @param institutionId institution ID
     * @param buffer file buffer
     * @param mimeType file MIME type
     * @param filename original file name
     * @returns uploaded logo metadata
     */
    static async uploadBrandingLogo(
        institutionId: string,
        buffer: Buffer,
        mimeType: string,
        filename: string,
    ): Promise<UploadedLogoMetadata> {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedMimes.includes(mimeType.toLowerCase())) {
            throw new Error('Unsupported image format. Allowed formats: PNG, JPEG, WebP.');
        }

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (buffer.length > MAX_SIZE) {
            throw new Error('Image size exceeds the 2MB limit.');
        }

        let image = sharp(buffer);
        const metadata = await image.metadata();
        let processedBuffer = buffer;

        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image file.');
        }

        if (metadata.width > 1000 || metadata.height > 1000) {
            image = image.resize({
                width: metadata.width > 1000 ? 1000 : undefined,
                height: metadata.height > 1000 ? 1000 : undefined,
                fit: 'inside',
                withoutEnlargement: true,
            });
            processedBuffer = await image.toBuffer();
        }

        const sha256 = createHash('sha256').update(processedBuffer).digest('hex');
        const bucket = PdfStorageService.PDF_BRANDING_BUCKET;
        const fileExt = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
        const storagePath = `logos/${institutionId}/${randomUUID()}-${sha256.substring(0, 16)}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from(bucket)
            .upload(storagePath, processedBuffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (uploadError) {
            throw new Error(`Failed to upload logo: ${uploadError.message}`);
        }

        return {
            bucket,
            path: storagePath,
            sizeBytes: processedBuffer.length,
            hashSha256: sha256,
            mimeType,
            originalName: filename,
        };
    }

    /**
     * Removes a logo from Supabase storage.
     *
     * @param bucket bucket name
     * @param path file path
     */
    static async deleteBrandingLogo(bucket: string, path: string): Promise<void> {
        const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
        if (error) {
            throw new Error(`Failed to delete logo from storage: ${error.message}`);
        }
    }

    /**
     * Uploads a PDF document to private storage bucket.
     * Enforces application/pdf content type, no upsert overwriting, and low cache TTL.
     */
    static async uploadPdf(bucket: string, path: string, buffer: Buffer): Promise<void> {
        const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
            contentType: 'application/pdf',
            upsert: false,
            cacheControl: '300', // 5 minutes TTL
        });
        if (error) {
            throw new Error(`Storage upload error: ${error.message}`);
        }
    }

    /**
     * Downloads a private stored file from the storage bucket.
     * Used for both PDF artifacts and branding assets.
     */
    static async downloadFile(bucket: string, path: string): Promise<Buffer> {
        const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
        if (error || !data) {
            throw new Error(`Storage download error: ${error?.message || 'unknown error'}`);
        }
        if (typeof data.arrayBuffer === 'function') {
            return Buffer.from(await data.arrayBuffer());
        }
        return Buffer.from(data as any);
    }

    /**
     * Generates a temporary signed download URL for a private PDF artifact.
     */
    static async createSignedUrl(
        bucket: string,
        path: string,
        expiresInSeconds = 300,
    ): Promise<string> {
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, expiresInSeconds);
        if (error || !data?.signedUrl) {
            throw new Error(
                `Storage signed URL generation error: ${error?.message || 'unknown error'}`,
            );
        }
        return data.signedUrl;
    }

    /**
     * Downloads a private PDF artifact from the storage bucket.
     */
    static async downloadPdf(bucket: string, path: string): Promise<Buffer> {
        return PdfStorageService.downloadFile(bucket, path);
    }

    /**
     * Deletes a private PDF artifact from the storage bucket.
     */
    static async deletePdf(bucket: string, path: string): Promise<void> {
        const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
        if (error) {
            throw new Error(`Storage file deletion error: ${error.message}`);
        }
    }
}
