/**
 * Parses a string, Date object, or nullish value into a valid Date object.
 * Returns null if the value is missing or represents an invalid date.
 *
 * @param value - The value to parse into a Date.
 * @returns A parsed Date object or null if invalid/missing.
 */
export function parseDateValue(value?: string | Date | null) {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
