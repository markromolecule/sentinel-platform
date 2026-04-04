/**
 * Coerces a value into a trimmed, non-empty string.
 */
export function coerceString(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

/**
 * Coerces a value into an array of non-empty strings.
 */
export function coerceStringArray(value: unknown) {
    if (!Array.isArray(value)) {
        return undefined;
    }

    const items = value
        .map((item) => coerceString(item))
        .filter((item): item is string => Boolean(item));

    return items.length > 0 ? items : undefined;
}

/**
 * Coerces a value into a boolean.
 */
export function coerceBoolean(value: unknown) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalizedValue = value.trim().toLowerCase();

        if (['true', 't', 'yes'].includes(normalizedValue)) {
            return true;
        }

        if (['false', 'f', 'no'].includes(normalizedValue)) {
            return false;
        }
    }

    return undefined;
}

/**
 * Dedupes and cleans up a string array.
 */
export function dedupe(values: string[]) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
