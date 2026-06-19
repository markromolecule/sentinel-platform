import { randomUUID } from 'crypto';
import { HTTPException } from 'hono/http-exception';
import { supabaseAdmin } from '../../../lib/supabase-admin';

const DEFAULT_BUCKET = 'images';
const PASSAGE_FOLDER = 'PASSAGE';
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map([
    ['image/png', 'png'],
    ['image/jpeg', 'jpg'],
    ['image/jpg', 'jpg'],
    ['image/webp', 'webp'],
    ['image/gif', 'gif'],
    ['image/avif', 'avif'],
]);

export type UploadedPassageImage = {
    bucket: string;
    path: string;
    url: string;
};

function resolveBucket() {
    return process.env.SUPABASE_PASSAGE_IMAGE_BUCKET?.trim() || DEFAULT_BUCKET;
}

function resolveExtension(file: File) {
    const extension = ALLOWED_MIME_TYPES.get(file.type);

    if (!extension) {
        throw new HTTPException(415, {
            message: 'Only PNG, JPEG, WebP, GIF, and AVIF images are supported.',
        });
    }

    return extension;
}

/**
 * Uploads a passage image to the configured bucket and returns the public URL metadata.
 */
export async function uploadPassageImage(
    file: File,
    userId: string,
): Promise<UploadedPassageImage> {
    if (!file || typeof file.arrayBuffer !== 'function') {
        throw new HTTPException(400, {
            message: 'A valid image file is required.',
        });
    }

    if (!file.type.startsWith('image/')) {
        throw new HTTPException(415, {
            message: 'Only image uploads are supported.',
        });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new HTTPException(413, {
            message: 'Image is too large. Maximum size is 10 MB.',
        });
    }

    const extension = resolveExtension(file);
    const bucket = resolveBucket();
    const safeUserId = userId.trim() || 'anonymous';
    const path = `${PASSAGE_FOLDER}/${safeUserId}/${Date.now()}-${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
        contentType: file.type,
        upsert: false,
    });

    if (uploadError) {
        throw new HTTPException(500, {
            message: `Failed to upload passage image: ${uploadError.message}`,
        });
    }

    const {
        data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    if (!publicUrl) {
        throw new HTTPException(500, {
            message: 'Image upload completed, but the public URL could not be resolved.',
        });
    }

    return {
        bucket,
        path,
        url: publicUrl,
    };
}
