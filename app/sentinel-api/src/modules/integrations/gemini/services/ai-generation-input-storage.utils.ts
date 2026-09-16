import type { BucketMetadata } from './ai-generation-input-storage.types';

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
}

export function sanitizeFileName(name: string): string {
    const baseName = name.split(/[\\/]/).pop()?.trim() || 'document.pdf';
    const normalized = baseName
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    if (!normalized) return 'document.pdf';
    return normalized.toLowerCase().endsWith('.pdf') ? normalized : `${normalized}.pdf`;
}

export function buildObjectPath(jobId: string, index: number, originalName: string): string {
    return `${jobId}/${String(index + 1).padStart(3, '0')}-${sanitizeFileName(originalName)}`;
}

export function isStorageNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const maybeError = error as { message?: unknown; statusCode?: unknown; status?: unknown };
    const status = maybeError.statusCode ?? maybeError.status;
    const message = typeof maybeError.message === 'string' ? maybeError.message.toLowerCase() : '';

    return status === 404 || message.includes('not found') || message.includes('does not exist');
}

export function toBucketMetadata(data: unknown): BucketMetadata | null {
    if (!data || typeof data !== 'object') return null;
    return data as BucketMetadata;
}
