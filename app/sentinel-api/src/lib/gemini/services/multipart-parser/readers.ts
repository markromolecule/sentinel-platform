import { HTTPException } from 'hono/http-exception';

export type MultipartBodyValue = string | File | (string | File)[] | undefined;
export type MultipartBody = Record<string, MultipartBodyValue>;

function isFileLike(entry: unknown): entry is File {
    if (!entry || typeof entry !== 'object') {
        return false;
    }

    if (typeof File !== 'undefined' && entry instanceof File) {
        return true;
    }

    const candidate = entry as Partial<File>;

    return (
        typeof candidate.name === 'string' &&
        typeof candidate.type === 'string' &&
        typeof candidate.size === 'number' &&
        typeof candidate.arrayBuffer === 'function'
    );
}

/**
 * Normalizes a multipart value into an array of entries.
 */
export function readMultipartValues(value: MultipartBodyValue) {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

/**
 * Extracts the first string value from a multipart field, prioritizing the first entry found.
 */
export function readMultipartString(value: MultipartBodyValue) {
    const first = readMultipartValues(value).find((entry) => typeof entry === 'string');
    return typeof first === 'string' ? first.trim() : undefined;
}

/**
 * Extracts all file entries from a multipart field.
 */
export function readMultipartFiles(value: MultipartBodyValue) {
    return readMultipartValues(value).filter(isFileLike);
}

/**
 * Coerces a value into a boolean based on common truthy/falsy strings.
 */
export function readBoolean(value: unknown) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    }

    return undefined;
}

/**
 * Coerces a value into an integer.
 */
export function readInteger(value: unknown) {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return undefined;
}

/**
 * Coerces a value into a string array, supporting JSON arrays or comma-separated values.
 */
export function readStringArray(value: unknown) {
    if (!value) return undefined;

    if (Array.isArray(value)) {
        return value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];

        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter((item): item is string => typeof item === 'string')
                        .map((item) => item.trim())
                        .filter(Boolean);
                }
            } catch {
                // Fall back to CSV parsing below.
            }
        }

        return trimmed
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return undefined;
}

/**
 * Parses a field as a JSON object, throwing an HTTP exception if invalid.
 */
export function readJsonObject(value: MultipartBodyValue) {
    const raw = readMultipartString(value);
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        throw new HTTPException(400, {
            message: 'The AI configuration field must contain valid JSON.',
        });
    }
}
